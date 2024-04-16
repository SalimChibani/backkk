import mongoose from "mongoose";

const exportSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    exportItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
      },
    ],

    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },

    exporter: {
      type: String,
      required: true,
    },

    numFact: {
      type: String,
      required: true,
    },
    factDate: {
      type: Date,
    },

    Price: {
      type: Number,
      required: true,
      default: 0.0,
    },


    paidAt: {
      type: Date,
    },

   
  },
  {
    timestamps: true,
  }
);

const Export = mongoose.model("Export", ExportSchema);
export default Export;
