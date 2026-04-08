const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ message: "Session expired" });
  }
};

module.exports = { adminAuth };
