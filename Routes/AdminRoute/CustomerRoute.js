const express = require("express");
const router = express.Router();

const customerController = require("../../Controller/AdminController/CustomerController");

const { authMiddleware } = require("../../middleware/authMiddleware");

// ✅ APPLY HERE
router.use(authMiddleware);

router.get("/", authMiddleware, customerController.getCustomers);
router.post("/", customerController.createCustomer);
router.put("/:id", customerController.updateCustomer);
router.delete("/:id", customerController.deleteCustomer);

module.exports = router;