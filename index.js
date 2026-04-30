const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const userRoute = require("./Routes/UserRoute/userRoute");
const adminRoute = require("./Routes/AdminRoute/AdminLoginRoute");
const productRoutes = require("./Routes/AdminRoute/ProductRoute");
const customerRoute = require("./Routes/AdminRoute/CustomerRoute");
const SubAdminRoute = require("./Routes/AdminRoute/SubAdminRoute");
const OrderRoute = require("./Routes/AdminRoute/OrderRoute");
const PaymentRoute = require("./Routes/AdminRoute/PaymentRoute");
const blogRoute = require("./Routes/AdminRoute/BlogRoute");
const TestimonialsRoute = require("./Routes/AdminRoute/TestimonialsRoute");
const ReviewRoute = require("./Routes/AdminRoute/ReviewRoute");
const CouponRoute = require("./Routes/AdminRoute/CouponRoute");
const PushNotificationRoute = require("./Routes/AdminRoute/PushNotificationRoute");
const diagnosisRoutes = require("./Routes/AdminRoute/DiagnosisRoute");
const AdminContactRoute = require("./Routes/AdminRoute/AdminContactRoute");
const AdminSliderRoute = require("./Routes/AdminRoute/AdminSliderRoute");
const AdminInstallationRoute = require("./Routes/AdminRoute/AdminInstallationRoute");

dotenv.config();

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "https://susolartech.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

/* ================= SERVER ================= */
const server = http.createServer(app);

/* ================= SOCKET IO ================= */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

let adminSocket = null;
const visitors = {};

io.on("connection", (socket) => {
  console.log("Socket Connected:", socket.id);

  /* ================= ADMIN JOIN ================= */
  socket.on("admin-join", () => {
    adminSocket = socket.id;

    console.log("Admin Joined:", socket.id);

    io.to(adminSocket).emit("visitor-list", Object.keys(visitors));
  });

  /* ================= VISITOR JOIN ================= */
  socket.on("visitor-join", (visitorId) => {
    console.log("Visitor Joined:", visitorId);

    visitors[visitorId] = socket.id;

    // Update admin visitor list
    if (adminSocket) {
      io.to(adminSocket).emit("visitor-list", Object.keys(visitors));
    }

    // Welcome message
    socket.emit("receive-message", {
      from: "Admin",
      message:
        "Hello! 👋 Welcome to Su Solartech support. How can I help you today?",
    });
  });

  /* ================= VISITOR TYPING ================= */
  socket.on("visitor-typing", ({ visitorId }) => {
    if (adminSocket) {
      io.to(adminSocket).emit("visitor-typing", visitorId);
    }
  });

  socket.on("visitor-stopped-typing", ({ visitorId }) => {
    if (adminSocket) {
      io.to(adminSocket).emit("visitor-stopped-typing", visitorId);
    }
  });

  /* ================= ADMIN TYPING ================= */
  socket.on("admin-typing", ({ visitorId }) => {
    const visitorSocket = visitors[visitorId];

    if (visitorSocket) {
      io.to(visitorSocket).emit("admin-typing");
    }
  });

  socket.on("admin-stopped-typing", ({ visitorId }) => {
    const visitorSocket = visitors[visitorId];

    if (visitorSocket) {
      io.to(visitorSocket).emit("admin-stopped-typing");
    }
  });

  /* ================= VISITOR MESSAGE ================= */
  socket.on("visitor-message", ({ visitorId, message }) => {
    console.log("Visitor Message:", visitorId, message);

    // Send ONLY to admin
    if (adminSocket) {
      io.to(adminSocket).emit("receive-message", {
        from: visitorId,
        message,
      });
    }
  });

  /* ================= ADMIN MESSAGE ================= */
  socket.on("admin-message", ({ visitorId, message }) => {
    console.log("Admin Message:", visitorId, message);

    const visitorSocket = visitors[visitorId];

    // Send ONLY to visitor
    if (visitorSocket) {
      io.to(visitorSocket).emit("receive-message", {
        from: "Admin",
        message,
      });
    }
  });

  /* ================= DISCONNECT ================= */
  socket.on("disconnect", () => {
    console.log("Socket Disconnected:", socket.id);

    // Remove visitor
    for (let visitorId in visitors) {
      if (visitors[visitorId] === socket.id) {
        delete visitors[visitorId];
      }
    }

    // Remove admin
    if (socket.id === adminSocket) {
      adminSocket = null;
      console.log("Admin Disconnected");
    }

    // Update visitor list
    if (adminSocket) {
      io.to(adminSocket).emit("visitor-list", Object.keys(visitors));
    }
  });
});

/* ================= ROUTES ================= */
app.use("/api", userRoute);
app.use("/api/admin", adminRoute);
app.use("/api/products", productRoutes);
app.use("/api/customer", customerRoute);
app.use("/api/sub-admins", SubAdminRoute);
app.use("/api/orders", OrderRoute);
app.use("/api/slider", AdminSliderRoute);
app.use("/api/payments", PaymentRoute);
app.use("/api/blogs", blogRoute);
app.use("/api/testnomial", TestimonialsRoute);
app.use("/api/reviews", ReviewRoute);
app.use("/api/coupons", CouponRoute);
app.use("/api/pushnotification", PushNotificationRoute);
app.use("/api/diagnosis", diagnosisRoutes);
app.use("/api/contact", AdminContactRoute);
app.use("/api/installations", AdminInstallationRoute);

/* ================= ROOT ================= */
app.get("/", (req, res) => {
  res.send("Welcome Node Project");
});

/* ================= DATABASE ================= */
mongoose
  .connect(process.env.MONGO_DB)
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log("Database Connection Error:", err);
  });

/* ================= START SERVER ================= */
const PORT = process.env.PORT || 8080;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server + Socket.IO running on port ${PORT}`);
});