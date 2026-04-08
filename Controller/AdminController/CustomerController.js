const Customer = require("../../Schema/AdminSchema/Customer");

/* ================= GET ALL CUSTOMERS ================= */
exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "Customers fetched successfully",
      data: customers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch customers",
      error: error.message,
    });
  }
};

/* ================= CREATE CUSTOMER ================= */
exports.createCustomer = async (req, res) => {
  try {
    const { userId, name, contact, country } = req.body;

    if (!userId || !name || !contact || !country) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await Customer.findOne({ userId });
    if (exists) {
      return res.status(409).json({ message: "User ID already exists" });
    }

    const customer = await Customer.create({
      userId,
      name,
      contact,
      country,
    });

    res.status(201).json({
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create customer",
      error: error.message,
    });
  }
};

/* ================= DELETE CUSTOMER ================= */
exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      message: "Customer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete customer",
      error: error.message,
    });
  }
};

/* ================= UPDATE CUSTOMER ================= */
exports.updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Customer.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({
      message: "Customer updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update customer",
      error: error.message,
    });
  }
};