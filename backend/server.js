const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const checkOutRoutes = require("./routes/checkOutRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express(); 

// Configure CORS with specific options
app.use(cors({
  origin: "http://localhost:5173", // Your frontend URL
  credentials: true, // Allow cookies and authentication headers
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

dotenv.config();

console.log(process.env.PORT)

const PORT = process.env.PORT || 3000;

//connect to the database
connectDB();

app.get("/", (req, res) => {
  res.send("WELCOME TO ULTIMATE CLOTHING API!");
});


//API Routes
app.use("/api/users",userRoutes);
app.use("/api/products",productRoutes);
app.use("/api/cart",cartRoutes);
app.use("/api/checkout", checkOutRoutes);
app.use("/api/orders", orderRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`); 
  console.log(`Frontend can access from http://localhost:5173/`);
});