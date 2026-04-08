const Order = require("../../Schema/AdminSchema/OrderSchema");
const Payment = require("../../Schema/AdminSchema/PaymentSchema");
const mongoose = require("mongoose");

const generateOrderId = async () => {
  try {
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    if (!lastOrder || !lastOrder.orderId) return "ORD1001";
    
    const lastId = parseInt(lastOrder.orderId.replace("ORD", ""));
    return "ORD" + (lastId + 1);
  } catch (error) {
    return "ORD" + Math.floor(Math.random() * 9000 + 1000);
  }
};

const generateCustomerId = async () => {
  try {
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    if (!lastOrder || !lastOrder.customerId) return "USR001";
    
    const lastId = parseInt(lastOrder.customerId.replace("USR", ""));
    return "USR" + String(lastId + 1).padStart(3, "0");
  } catch (error) {
    return "USR" + Math.floor(Math.random() * 900 + 100);
  }
};

const generateTransactionId = () => {
  return "TXN" + Date.now() + Math.floor(Math.random() * 1000);
};

// Automatically create payment when order is created
const createPaymentForOrder = async (order, userId) => {
  try {
    const existingPayment = await Payment.findOne({ orderId: order._id });
    
    if (existingPayment) {
      // Update existing payment
      existingPayment.amount = order.total;
      existingPayment.customerName = order.customerName;
      existingPayment.orderNumber = order.orderId;
      
      // Update payment status based on order status
      if (order.status === "Completed") {
        existingPayment.status = "Completed";
      } else if (order.status === "Cancelled") {
        existingPayment.status = "Failed";
      } else {
        existingPayment.status = "Pending";
      }
      
      await existingPayment.save();
      return existingPayment;
    } else {
      // Create new payment
      const payment = new Payment({
        orderId: order._id,
        userId: userId || new mongoose.Types.ObjectId(), // Default user ID
        amount: order.total,
        method: "UPI", // Default payment method
        status: order.status === "Completed" ? "Completed" : "Pending",
        transactionId: generateTransactionId(),
        country: order.country || "India",
        customerName: order.customerName,
        orderNumber: order.orderId,
      });
      
      await payment.save();
      return payment;
    }
  } catch (error) {
    console.error("Error creating payment:", error);
    return null;
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ status: true, data: orders });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

const addOrder = async (req, res) => {
  try {
    const {
      customerName, phone, email, address, pincode,
      country, state, district, city, addressType,
      productId, quantity, amount, gstRate, gst,
      total, source, status, date
    } = req.body;

    const orderId = await generateOrderId();
    const customerId = await generateCustomerId();

    const newOrder = new Order({
      orderId,
      customerId,
      customerName,
      phone,
      email,
      address,
      pincode,
      country: country || "India",
      state,
      district,
      city,
      addressType: addressType || "Home",
      productId,
      quantity: quantity || 1,
      amount,
      gstRate: gstRate || 18,
      gst: gst || 0,
      total,
      source: source || "Telecaller",
      status: status || "Pending",
      date: date || new Date(),
    });

    await newOrder.save();
    
    // Automatically create payment for this order
    await createPaymentForOrder(newOrder, req.user?._id);
    
    res.status(201).json({ 
      status: true, 
      message: "Order created successfully", 
      data: newOrder 
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ status: false, message: "Order not found" });
    }

    // Automatically update/create payment when order is updated
    await createPaymentForOrder(updatedOrder, req.user?._id);

    res.json({ 
      status: true, 
      message: "Order updated successfully", 
      data: updatedOrder 
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ status: false, message: "Order not found" });
    
    order.status = "Cancelled";
    await order.save();

    // Update payment status to Failed when order is cancelled
    await Payment.findOneAndUpdate(
      { orderId: order._id },
      { status: "Failed" },
      { new: true }
    );

    res.json({ status: true, message: "Order cancelled successfully", data: order });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// Get payments with order details
const getOrderPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: 'orderId',
        select: 'orderId customerName phone email address country state city status total'
      })
      .sort({ createdAt: -1 });
    
    res.json({ status: true, data: payments });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

const getPaidOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: "Completed" })
      .sort({ createdAt: -1 });

    res.json({ status: true, data: orders });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

module.exports = { 
  getAllOrders, 
  addOrder, 
  updateOrder, 
  cancelOrder, 
  getPaidOrders,
  getOrderPayments 
};

