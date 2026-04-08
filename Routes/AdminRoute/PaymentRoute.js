const express = require("express");
const {
  getAllOrders,
  getPaidOrders, 
  addOrder,
  updateOrder,
  cancelOrder,
  getOrderPayments
} = require("../../Controller/AdminController/OrderController");
const { authMiddleware } = require("../../middleware/authMiddleware");
const activityTracker = require("../../middleware/activityTracker");

const router = express.Router();
router.use(authMiddleware, activityTracker)
router.get("/", getAllOrders);
router.get("/paid", getPaidOrders);
router.get("/payments", getOrderPayments); // New route to get payments
router.post("/", addOrder);
router.put("/:id", updateOrder);
router.delete("/:id", cancelOrder);

module.exports = router;