const express = require("express");
const Checkout = require("../models/Checkout");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "../uploads/bank_transfers");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      "bank-transfer-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG and GIF are allowed."));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
});

// @route POST /api/checkout
// @desc Create a new checkout session
// @access Private
router.post("/", protect, upload.single("bankTransferProof"), async (req, res) => {
  try {
    // Parse the JSON strings from form data
    const checkoutItems = JSON.parse(req.body.checkoutItems);
    const shippingAddress = JSON.parse(req.body.shippingAddress);
    const { paymentMethod, totalPrice } = req.body;

    if (!checkoutItems || checkoutItems.length === 0) {
      return res.status(400).json({ message: "No items in checkout" });
    }

    const checkoutItemsWithDetails = checkoutItems.map((item) => {
      return {
        productId: item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        description: item.description || "",
        customImage: item.customImage || null // Include custom image
      };
    });

    const calculatedTotalPrice = checkoutItemsWithDetails.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const newCheckout = new Checkout({
      user: req.user._id,
      checkoutItems: checkoutItemsWithDetails,
      shippingAddress,
      paymentMethod,
      totalPrice: calculatedTotalPrice,
      paymentStatus: paymentMethod === "PayPal" ? "pending" : "unpaid",
      bankTransferProof: paymentMethod === "BankTransfer" && req.file 
        ? `/uploads/bank_transfers/${req.file.filename}`
        : null,
    });

    const checkout = await newCheckout.save();
    
    res.status(201).json({
      data: {
        _id: checkout._id,
        ...checkout._doc
      }
    });
  } catch (error) {
    console.error("Error creating Checkout session:", error);
    res.status(500).json({ 
      message: "Server Error",
      error: error.message 
    });
  }
});
  
  
  // @route GET /api/checkout/:id
// @desc Get checkout details by ID
// @access Private
// This route should return the checkout based on ID
router.get("/:id", protect, async (req, res) => {
    try {
      const checkout = await Checkout.findById(req.params.id).populate('checkoutItems.productId');
      if (!checkout) {
        return res.status(404).json({ message: "Checkout not found" });
      }
      res.json(checkout);
    } catch (error) {
      console.error("Error fetching checkout details:", error);
      res.status(500).json({ message: "Server Error" });
    }
  });
  
  


// @route PUT /api/checkout/:id/pay
// @desc Update checkout to mark as paid after successful payment
// @access Private
// PUT /api/checkout/:id/pay - Update checkout status to paid
router.put("/:id/pay", protect, async (req, res) => {
    const { paymentStatus, paymentDetails } = req.body;
  
    try {
      const checkout = await Checkout.findById(req.params.id);
      if (!checkout) {
        return res.status(404).json({ message: "Checkout not found" });
      }
  
      // If PayPal selected
      if (paymentStatus === "paid") {
        checkout.isPaid = true;
        checkout.paidAt = Date.now();
        checkout.paymentStatus = "paid";
        checkout.paymentDetails = paymentDetails;
      } else if (paymentStatus === "unpaid") {
        // Cash on delivery or Bank Transfer
        checkout.paymentStatus = "unpaid";
      }
  
      await checkout.save();
      res.status(200).json(checkout);
    } catch (error) {
      console.error("Error updating Checkout payment status:", error);
      res.status(500).json({ message: "Server Error" });
    }
  });

// @route POST /api/checkout/:id/finalize
// @desc Finalize checkout and convert to an order after payment confirmation
// @access Private
router.post("/:id/finalize", protect, async (req, res) => {
  try {
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout || checkout.isFinalized) {
      return res.status(400).json({ message: "Invalid checkout or already finalized" });
    }

    // Create an order from the checkout details
    const order = new Order({
      user: checkout.user,
      orderItems: checkout.checkoutItems.map(item => ({
        productId: item.productId,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        description: item.description,
        customImage: item.customImage // Include custom image in order
      })),
      shippingAddress: checkout.shippingAddress,
      paymentMethod: checkout.paymentMethod,
      totalPrice: checkout.totalPrice,
      isPaid: checkout.isPaid,
      paidAt: checkout.paidAt,
      paymentStatus: checkout.paymentStatus,
      status: "Processing",
    });

    const savedOrder = await order.save();
    checkout.isFinalized = true;
    checkout.finalizedAt = Date.now();
    await checkout.save();

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Error finalizing checkout:", error);
    res.status(500).json({ message: "Server Error" });
  }
});
  
router.post('/create-checkout', protect, async (req, res) => {
    const { userId, shippingAddress, paymentMethod } = req.body;

    try {
      // 1. Ensure the user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // 2. Create an empty checkoutItems array (no products for this test case)
      const checkoutItems = []; // No products
  
      // 3. Calculate totalPrice (in this case, it will be 0 since there are no products)
      const totalPrice = 0;
  
      // 4. Create a new Checkout entry with no products
      const newCheckout = new Checkout({
        user: userId,
        checkoutItems, // Empty checkoutItems array
        shippingAddress,
        paymentMethod,
        totalPrice, // 0 as no products are added
      });
  
      // 5. Save checkout entry to the database
      await newCheckout.save();
  
      res.status(201).json({
        message: 'Checkout created successfully with no products',
        checkout: newCheckout
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating checkout', error: error.message });
    }
  });


module.exports = router;