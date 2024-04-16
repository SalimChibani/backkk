import express from "express";
const router = express.Router();

import {
  createExport,
  getAllExports,
  getUserExports,
  countTotalExports,
  calculateTotalSales,
  calcualteTotalSalesByDate,
  findExportById,
  markExportAsPaid,
  markExportAsDelivered,
} from "../controllers/exportController.js";

import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

router
  .route("/")
  .post(authenticate, createExport)
  .get(authenticate, authorizeAdmin, getAllExports);

router.route("/mine").get(authenticate, getUserExports);
router.route("/total-exports").get(countTotalExports);
router.route("/total-sales").get(calculateTotalSales);
router.route("/total-sales-by-date").get(calcualteTotalSalesByDate);
router.route("/:id").get(authenticate, findExportById);
router.route("/:id/pay").put(authenticate, markExportAsPaid);
router
  .route("/:id/deliver")
  .put(authenticate, authorizeAdmin, markExportAsDelivered);

export default router;
