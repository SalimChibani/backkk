import Export from "../models/exportModel.js";
import Product from "../models/productModel.js";

// Utility Function
function calcPrices(exportItems) {
  const itemsPrice = exportItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxRate = 0.15;
  const taxPrice = (itemsPrice * taxRate).toFixed(2);

  const totalPrice = (
    itemsPrice +
    shippingPrice +
    parseFloat(taxPrice)
  ).toFixed(2);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice,
    totalPrice,
  };
}

const createExport = async (req, res) => {
  try {
    const { exportItems, shippingAddress, paymentMethod } = req.body;

    if (exportItems && exportItems.length === 0) {
      res.status(400);
      throw new Error("No export items");
    }

    const itemsFromDB = await Product.find({
      _id: { $in: exportItems.map((x) => x._id) },
    });

    const dbExportItems = exportItems.map((itemFromClient) => {
      const matchingItemFromDB = itemsFromDB.find(
        (itemFromDB) => itemFromDB._id.toString() === itemFromClient._id
      );

      if (!matchingItemFromDB) {
        res.status(404);
        throw new Error(`Product not found: ${itemFromClient._id}`);
      }

      return {
        ...itemFromClient,
        product: itemFromClient._id,
        price: matchingItemFromDB.price,
        _id: undefined,
      };
    });

    const { itemsPrice, taxPrice, shippingPrice, totalPrice } =
      calcPrices(dbExportItems);

    const exportOrder = new Export({
      exportItems: dbExportItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdExport = await exportOrder.save();
    res.status(201).json(createdExport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllExports = async (req, res) => {
  try {
    const exports = await Export.find({}).populate("user", "id username");
    res.json(exports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserExports = async (req, res) => {
  try {
    const exports = await Export.find({ user: req.user._id });
    res.json(exports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const countTotalExports = async (req, res) => {
  try {
    const totalExports = await Export.countDocuments();
    res.json({ totalExports });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const calculateTotalSales = async (req, res) => {
  try {
    const exports = await Export.find();
    const totalSales = exports.reduce((sum, exportItem) => sum + exportItem.totalPrice, 0);
    res.json({ totalSales });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const calcualteTotalSalesByDate = async (req, res) => {
  try {
    const salesByDate = await Export.aggregate([
      {
        $match: {
          isPaid: true,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$paidAt" },
          },
          totalSales: { $sum: "$totalPrice" },
        },
      },
    ]);

    res.json(salesByDate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const findExportById = async (req, res) => {
  try {
    const exportItem = await Export.findById(req.params.id).populate(
      "user",
      "username email"
    );

    if (exportItem) {
      res.json(exportItem);
    } else {
      res.status(404);
      throw new Error("Export not found");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markExportAsPaid = async (req, res) => {
  try {
    const exportItem = await Export.findById(req.params.id);

    if (exportItem) {
      exportItem.isPaid = true;
      exportItem.paidAt = Date.now();
      exportItem.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.payer.email_address,
      };

      const updateExport = await exportItem.save();
      res.status(200).json(updateExport);
    } else {
      res.status(404);
      throw new Error("Export not found");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markExportAsDelivered = async (req, res) => {
  try {
    const exportItem = await Export.findById(req.params.id);

    if (exportItem) {
      exportItem.isDelivered = true;
      exportItem.deliveredAt = Date.now();

      const updatedExport = await exportItem.save();
      res.json(updatedExport);
    } else {
      res.status(404);
      throw new Error("Export not found");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  createExport,
  getAllExports,
  getUserExports,
  countTotalExports,
  calculateTotalSales,
  calcualteTotalSalesByDate,
  findExportById,
  markExportAsPaid,
  markExportAsDelivered,
};
