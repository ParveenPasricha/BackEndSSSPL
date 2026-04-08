const User = require("../../Schema/UserSchema/userSchema");

// ================= GET PROFILE =================
exports.getProfile = async (req, res) => {
  res.json({
    success: true,
    user: {
      name: req.user.name,
      email: req.user.email,
      mobile: req.user.mobile,
      role: req.user.role,
      createdAt: req.user.createdAt,
    },
  });
};

// ================= UPDATE PROFILE =================
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (email && email !== req.user.email) {
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    req.user.name = name || req.user.name;
    req.user.email = email || req.user.email;

    await req.user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        name: req.user.name,
        email: req.user.email,
        mobile: req.user.mobile,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("name mobile email createdAt") 
      .sort({ createdAt: 1 });

    const customers = users.map((u, index) => ({
      _id: u._id,
      userId: `CUS-${1001 + index}`,
      name: u.name || "Guest User",
      email: u.email || "-",     
      contact: u.mobile,
      country: "India",
      registered: u.createdAt,
    }));

    customers.reverse();

    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
};


