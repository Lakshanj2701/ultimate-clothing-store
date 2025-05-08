const express = require("express");
const { protect, admin } = require("../middleware/authMiddleware");
const ReturnRefundRequest = require("../models/returnRefundRequestModel");
const Order = require("../models/Order"); // Import the Order model

const router = express.Router();

// @route GET /api/admin/return-refund
// @desc Get all return/refund requests (Admin Only) with optional filtering by status
// @access Private/Admin
router.get("/", protect, admin, async (req, res) => {
    try {
      const { status } = req.query; // Extract status query param
  
      // Build the query filter object
      let filter = {};
      if (status && status !== 'all') {
        filter.status = status;
      }
  
      const requests = await ReturnRefundRequest.find(filter).populate("user", "name email").populate("orderId");
      res.json(requests);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  

// @route PUT /api/admin/return-refund/approve/:id
// @desc Approve a return/refund request and update the order status to cancelled
// @access Private/Admin
router.put("/approve/:id", protect, admin, async (req, res) => {
    try {
      // Find the return/refund request by ID
      const request = await ReturnRefundRequest.findById(req.params.id);
  
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
  
      if (request.status !== "Pending") {
        return res.status(400).json({ message: "Request already processed" });
      }
  
      // Approve the return/refund request
      request.status = "Approved";
      await request.save();
  
      // Find the related order
      const order = await Order.findById(request.orderId);
  
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      // Update the order status to 'Cancelled'
      order.status = "Cancelled";
      await order.save();
  
      res.json({
        message: "Return/Refund request approved and order status updated to 'Cancelled'",
        request,
        order,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

// @route PUT /api/admin/return-refund/reject/:id
// @desc Reject a return/refund request
// @access Private/Admin
router.put("/reject/:id", protect, admin, async (req, res) => {
  try {
    const request = await ReturnRefundRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({ message: "Request already processed" });
    }

    request.status = "Rejected";
    await request.save();

    res.json({ message: "Return/Refund request rejected", request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
