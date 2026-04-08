const jwt = require("jsonwebtoken");
const Admin = require("../Schema/AdminSchema/Login");
const SubAdmin = require("../Schema/AdminSchema/SubAdmin");
const dotenv = require("dotenv");
dotenv.config();

const authMiddleware = async (req, res, next) => {
  console.log("Auth middleware triggered");
  console.log("Authorization header:", req.headers.authorization);
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "No token provided, authorization denied" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user = null;
    let userRole = decoded.role;

    // Find user based on role
    if (userRole === "admin") {
      user = await Admin.findById(decoded.id).select("-adminPassword");
    } 
    else if (userRole === "sub-admin") {
      user = await SubAdmin.findById(decoded.id).select("-password");
    } 
    else {
      return res.status(401).json({ message: "Invalid user role" });
    }

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Add user info to request object
    req.user = {
      id: user._id,
      email: userRole === "admin" ? user.adminEmail : user.email,
      role: userRole,
      logId: decoded.logId,
      ...(userRole === "sub-admin" && { 
        name: user.name,
        permissions: user.permissions 
      })
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    
    res.status(500).json({ message: "Server authentication error" });
  }
};

// Role-based authorization middleware
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. ${req.user.role} not allowed.` 
      });
    }

    next();
  };
};

// Permission check middleware for sub-admins
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Admin has all permissions
    if (req.user.role === "admin") {
      return next();
    }

    // Sub-admin permission check
    if (req.user.role === "sub-admin") {
      if (!req.user.permissions || !Array.isArray(req.user.permissions)) {
        return res.status(403).json({ 
          message: "No permissions assigned" 
        });
      }

      if (req.user.permissions.includes(requiredPermission) || 
          req.user.permissions.includes("all")) {
        return next();
      }
    }

    return res.status(403).json({ 
      message: `Permission '${requiredPermission}' required` 
    });
  };
};

module.exports = {
  authMiddleware,
  authorizeRole,
  checkPermission
};