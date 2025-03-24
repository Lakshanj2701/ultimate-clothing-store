const express = require("express");
const Order = require("../models/Order");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router(); // ✅ Fixed extra space

// @route   GET /api/admin/orders
// @desc    Get all orders (Admin only)
// @access  Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user", "name email"); // ✅ Populating user details
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error); // ✅ Better error logging
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router; // ✅ Exporting router
