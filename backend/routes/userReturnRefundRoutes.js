const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const ReturnRefundRequest = require("../models/returnRefundRequestModel");
const Order = require("../models/Order");

const router = express.Router();

// @route POST /api/return-refund/create
// @desc Create a return/refund request
// @access Private
router.post("/create", protect, async (req, res) => {
  const { orderId, reason } = req.body;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to request return" });
    }

    const request = new ReturnRefundRequest({
      user: req.user._id,
      orderId: order._id,
      reason,
    });

    await request.save();
    res.status(201).json({ message: "Return/Refund request created successfully", request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route GET /api/return-refund/my-requests
// @desc Get all return/refund requests by the logged-in user
// @access Private
router.get("/my-requests", protect, async (req, res) => {
  try {
    const requests = await ReturnRefundRequest.find({ user: req.user._id }).populate("orderId");
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route PUT /api/return-refund/update/:id
// @desc Update return/refund request before approval
// @access Private
router.put("/update/:id", protect, async (req, res) => {
  try {
    const request = await ReturnRefundRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.status !== "Pending") {
      return res.status(400).json({ message: "Request cannot be updated once approved/rejected" });
    }

    if (request.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this request" });
    }

    request.reason = req.body.reason || request.reason;
    await request.save();

    res.json({ message: "Return/Refund request updated successfully", request });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route DELETE /api/return-refund/delete/:id
// @desc Delete a return/refund request before approval
// @access Private
router.delete("/delete/:id", protect, async (req, res) => {
    try {
      // Find the request by ID
      const request = await ReturnRefundRequest.findById(req.params.id);
  
      // If request not found, return an error
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
  
      // Ensure the request status is 'Pending'
      if (request.status !== "Pending") {
        return res.status(400).json({ message: "Request cannot be deleted once approved/rejected" });
      }
  
      // Ensure the logged-in user is the one who created the request
      if (request.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized to delete this request" });
      }
  
      // Remove the request from the database
      await request.remove();
  
      // Respond with success message
      res.json({ message: "Return/Refund request deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  

module.exports = router;
