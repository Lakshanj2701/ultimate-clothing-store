const express = require("express");
const checkOut = require("../models/Checkout");
const products = require("../models/Product");
const Order = require("../models/Order");
const mongoose = require("mongoose"); 
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// @route   GET /api/admin/orders
// @desc    Get all orders (Admin only)
// @access  Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    const checkorders = await checkOut.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    
    // Map the results to include full image URLs
    const ordersWithImageUrls = checkorders.map(order => ({
      ...order._doc,
      bankTransferProof: order.bankTransferProof 
        ? `${req.protocol}://${req.get('host')}${order.bankTransferProof}`
        : null
    }));

    res.json(ordersWithImageUrls);
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
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // 1. Update the Checkout payment status
      const checkorders = await checkOut.findById(req.params.id).session(session);
      
      if (!checkorders) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ message: "Checkout not found" });
      }

      checkorders.paymentStatus = req.body.paymentStatus;
      checkorders.paidAt = req.body.paymentStatus === "paid" ? Date.now() : null;

      const updatedCheckout = await checkorders.save({ session });

      // 2. Find and update all related Orders
      await Order.updateMany(
        { 
          user: checkorders.user,
          paymentStatus: { $ne: req.body.paymentStatus } // Only update if status is different
        },
        { 
          $set: { 
            paymentStatus: req.body.paymentStatus,
            isPaid: req.body.paymentStatus === "paid",
            paidAt: req.body.paymentStatus === "paid" ? Date.now() : null
          } 
        },
        { session }
      );

      await session.commitTransaction();
      session.endSession();
      
      res.json(updatedCheckout);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error("Error updating Checkout payment status:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// @route   DELETE /api/admin/orders/:id
// @desc    Delete an order
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
      const checkorders = await checkOut.findById(req.params.id);

      if (checkorders) {
          await checkOut.deleteOne();
          res.json({ message: "Checkout removed" });
      } else {
          res.status(404).json({ message: "Checkout not found" });
      }
  } catch (error) {
    console.error( error); 
    res.status(500).json({ message: "Server error" });    
  }
});


router.post('/create' , protect , async (req , res) => {
  const { checkoutItems, shippingAddress, paymentMethod, totalPrice } = req.body;
  try {
    const user = req.user._id; // Get the authenticated user

    // Step 1: Fetch product details from the Product collection using the product IDs
    const productIds = checkoutItems.map(item => item.productId);
    const products = await products.find({ '_id': { $in: productIds } });

    if (products.length === 0) {
        return res.status(400).json({ message: 'No products found' });
    }

    // Step 2: Map the products and add them to the checkoutItems array
    const checkoutItemsWithDetails = checkoutItems.map(item => {
        const product = products.find(p => p._id.toString() === item.productId);
        return {
            productId: product._id,
            name: product.name,
            image: product.image,
            price: product.price,
            quantity: item.quantity, 
        };
    });

    // Step 3: Create a new Checkout entry
    const newCheckout = new checkOut({
        user,
        checkoutItems: checkoutItemsWithDetails,
        shippingAddress,
        paymentMethod,
        totalPrice,
        isPaid: false, 
    });

    // Save the checkout to the database
    const savedCheckout = await newCheckout.save();
    res.status(201).json(savedCheckout);
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating checkout' });
}
});


router.post('/create', protect, async (req, res) => {
    const { userId, shippingAddress, paymentMethod } = req.body;

    try {
      // Check the user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Create an empty checkoutItems array 
      const checkoutItems = []; // No products
  
      // Calculate totalPrice 
      const totalPrice = 0;
  
      // Create a new Checkout entry with no products
      const newCheckout = new checkOut({
        user: userId,
        checkoutItems, 
        shippingAddress,
        paymentMethod,
        totalPrice, 
      });
  
      // Save checkout entry to the database
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
 