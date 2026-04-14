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
const { authMiddleware } = require("./middleware/authMiddleware");
const activityTracker = require("./middleware/activityTracker");
dotenv.config();

const app = express();

app.use(express.json());

const allowedOrigins = [
  "https://susolartech.vercel.app",
  "http://localhost:5173",
];
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

let adminSocket = null;
const visitors = {};

io.on("connection", (socket) => {
  console.log("Socket Connected:", socket.id);

  socket.on("admin-join", () => {
    adminSocket = socket.id;
    // console.log("Admin Joined:", socket.id);
    io.to(adminSocket).emit("visitor-list", Object.keys(visitors));
  });

  socket.on("visitor-join", (visitorId) => {
    console.log("Visitor Joined:", visitorId);
    visitors[visitorId] = socket.id;

    if (adminSocket) {
      io.to(adminSocket).emit("visitor-list", Object.keys(visitors));
    }

    // Send welcome message to visitor
    const welcomeMessage = {
      from: "Admin",
      message:
        "Hello! 👋 Welcome to Su Solartech support. How can I help you today?",
    };
    socket.emit("receive-message", welcomeMessage);
  });

  // Typing indicators
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

  socket.on("visitor-message", ({ visitorId, message }) => {
    // Send to admin if available
    if (adminSocket) {
      io.to(adminSocket).emit("receive-message", {
        from: visitorId,
        message,
      });
    }

    // ALSO echo back to visitor (important)
    const visitorSocket = visitors[visitorId];
    if (visitorSocket) {
      io.to(visitorSocket).emit("receive-message", {
        from: "You",
        message,
      });
    }
  });

  socket.on("admin-message", ({ visitorId, message }) => {
    const visitorSocket = visitors[visitorId];
    if (visitorSocket) {
      io.to(visitorSocket).emit("receive-message", {
        from: "Admin",
        message,
      });
    }
  });

  socket.on("disconnect", () => {
    for (let v in visitors) {
      if (visitors[v] === socket.id) delete visitors[v];
    }

    if (socket.id === adminSocket) adminSocket = null;

    if (adminSocket) {
      io.to(adminSocket).emit("visitor-list", Object.keys(visitors));
    }

    console.log("Socket Disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
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

app.get("/", (req, res) => {
  res.send("Welcome Node Project");
});

mongoose
  .connect(process.env.MONGO_DB)
  .then(() => {
    console.log("Database Connected");
  })
  .catch((err) => console.error("Database Connection Error:", err));

// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`Server running on port ${PORT}`);
// });
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server + Socket.IO running on port ${PORT}`);
});
