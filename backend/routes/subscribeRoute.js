const express = require("express");
const router = express.Router();
const Subscriber = require("../models/Subscriber");

// @route   POST /api/subscribe
// @desc    Handle newsletter subscription
// @access  Public
router.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Check if email is already subscribed
    const existingSubscriber = await Subscriber.findOne({ email });

    if (existingSubscriber) {
      return res.status(400).json({ message: "This email is already subscribed." });
    }

    // Create a new subscriber
    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save(); 

    res.status(201).json({ message: "Successfully subscribed to the newsletter!" });

  } catch (error) {
    console.error("Subscription Error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

module.exports = router;
