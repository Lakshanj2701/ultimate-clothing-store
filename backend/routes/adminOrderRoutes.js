const express = require("express");
const Order = require("../models/Order");
const User = require("../models/User"); // Add this import
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// @route   GET /api/admin/orders
// @desc    Get all orders (Admin only)
// @access  Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    const orders = await Order.find({}).populate("user", "name email"); 
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error); 
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   PUT /api/admin/orders/:id
// @desc    Update order status
// @access  Private/Admin

router.put("/:id", protect, admin, async (req, res) => {
  try {
      const order = await Order.findById(req.params.id);

      if (order) {
          order.status = req.body.status || order.status;
          order.isDelivered = req.body.status === "Delivered" ? true : order.isDelivered;
          order.deliveredAt = req.body.status === "Delivered" ? Date.now() : order.deliveredAt;

          const updatedOrder = await order.save();
          res.json(updatedOrder);
      } else {
          res.status(404).json({ message: "Order not found" });
      }
  } catch (error) {
      console.error( error); 
      res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status (Admin only)
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = status;
        order.updatedAt = Date.now();

        if (status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        const updatedOrder = await order.save();

        res.json({
            success: true,
            order: updatedOrder
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Error updating order status' });
    }
});

// @route   PUT /api/admin/orders/:id/details
// @desc    Update order details (total price and customer name)
// @access  Private/Admin
router.put('/:id/details', protect, admin, async (req, res) => {
    try {
        const { totalPrice, customerName } = req.body;
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update order details
        if (totalPrice !== undefined) {
            order.totalPrice = totalPrice;
        }

        // If customer name needs to be updated
        if (customerName !== undefined && order.user) {
            const userUpdateResult = await User.findByIdAndUpdate(
                order.user._id,
                { name: customerName },
                { new: true }
            );

            if (!userUpdateResult) {
                return res.status(404).json({ message: 'User not found' });
            }
        }

        const updatedOrder = await order.save();
        
        // Fetch fresh data with populated user
        const populatedOrder = await Order.findById(updatedOrder._id)
            .populate('user', 'name email');

        res.json(populatedOrder);
    } catch (error) {
        console.error('Error updating order details:', error);
        res.status(500).json({ 
            message: 'Error updating order details',
            error: error.message 
        });
    }
});

// @route   DELETE /api/admin/orders/:id
// @desc    Delete an order
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
      const order = await Order.findById(req.params.id);

      if (order) {
          await order.deleteOne();
          res.json({ message: "Order removed" });
      } else {
          res.status(404).json({ message: "Order not found" });
      }
  } catch (error) {
    console.error( error); 
    res.status(500).json({ message: "Server error" });    
  }
});

module.exports = router;
