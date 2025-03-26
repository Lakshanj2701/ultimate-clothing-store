const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const subscribeRoute = require("./routes/subscribeRoute");
const adminRoutes = require("./routes/adminRoutes");
const productAdminRoutes = require("./routes/productAdminRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const cartRoutes = require("./routes/cartRoutes");
const checkOutRoutes = require("./routes/checkOutRoutes");
const orderRoutes = require("./routes/orderRoutes");
const advertismentRoutes = require("./routes/advertismentRoutes");

const app = express();

dotenv.config();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

const PORT = process.env.PORT || 9000;

// Connect to the database
connectDB();

// API Routes
app.get("/", (req, res) => {
    res.send("WELCOME TO RABBIT API!");
});

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", subscribeRoute);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkOutRoutes);
app.use("/api/orders", orderRoutes);

// Admin Routes
app.use("/api/admin/users", adminRoutes);
app.use("/api/admin/products", productAdminRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/advertisements", advertismentRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
