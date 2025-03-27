const express = require("express");
const Checkout = require("../models/Checkout");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router(); 

// @route POST /api/checkout
// @desc Create a new checkout session
// @access Private
router.post("/", protect, async (req, res) => {
    const { checkoutItems, shippingAddress, paymentMethod, totalPrice } = 
    req.body;

    // Check if checkoutItems exist and are valid
    if (!checkoutItems || checkoutItems.length === 0) {
        return res.status(400).json({ message: "No items in checkout" });
    }
    
    try {
        //Create new checkOut session
        const newCheckout = await Checkout.create({
            user: req.user._id,
            checkoutItems: checkoutItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            paymentDetails: "Pending",
            isPaid: false,
        });

        console.log(`Checkout created for user: ${req.user._id}`);
        res.status(201).json(newCheckout)
    } catch (error) {
        console.error("Error creating Checkout session:", error);
        res.status(500).json({message: "Server Error"});
    }

   
});

// @route PUT /api/checkout/:id/pay
// @desc Update checkout to mark as paid after successful payment
// @access Private
router.put("/:id/pay", protect, async (req, res) => {
    const { paymentStatus, paymentDetails } = req.body;

    try {
        const checkout = await Checkout.findById(req.params.id);

        if (!checkout) {
            return res.status(404).json({ message: "Checkout not found" });
        }

        //  Ensure the payment status is valid
        if (paymentStatus === "paid") {
            checkout.isPaid = true;
            checkout.paidAt = Date.now();
            checkout.paymentStatus = "paid";
            checkout.paymentDetails = paymentDetails;

            await checkout.save();

            res.status(200).json({ checkout });
        } else {
            res.status(400).json({ message: "Invalid payment status" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

// @route POST /api/checkout/:id/finalize
// @desc finalize checkout and convert to an order after payment confirmation
// @access Private
router.post("/:id/finalize", protect, async (req, res) => {
    try {
        const checkout = await Checkout.findById(req.params.id);

        if (!checkout) {
            return res.status(404).json({ message: "Checkout not found" });
        }

        if (checkout.isPaid && !checkout.isFinalized) {

            // Create final order based on the checkout details
            const finalOrder = await Order.create({
                user: checkout.user,
                orderItems: checkout.checkoutItems,
                shippingAddress: checkout.shippingAddress,
                paymentMethod: checkout.paymentMethod,
                totalPrice: checkout.totalPrice,
                isPaid: true,
                paidAt: checkout.paidAt,
                isDelivered: false,
                paymentStatus: "paid",
                paymentDetails: checkout.paymentDetails,
            });

            // Mark the checkout as finalized
            checkout.isFinalized = true;
            checkout.finalizedAt = Date.now();
            await checkout.save();

            // Delete the cart associated with the user
            await Cart.findOneAndDelete({ user: checkout.user });
            res.status(201).json(finalOrder);
        } else if (checkout.isFinalized) {
            res.status(400).json({ message: "Checkout already finalized" });
        } else {
            res.status(400).json({ message: "Checkout is not paid" });
        }
        
    } catch (error) {
        console.error(error);
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