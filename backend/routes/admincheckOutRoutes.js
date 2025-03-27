const express = require("express");
const checkOut = require("../models/Checkout");
const products = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// @route   GET /api/admin/orders
// @desc    Get all orders (Admin only)
// @access  Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    const checkorders = await checkOut.find({}).populate("user", "name email"); 
    res.json(checkorders);
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
      const checkorders = await checkOut.findById(req.params.id);

      if (checkorders) {
        checkorders.paymentStatus = req.body.paymentStatus; // Set new payment status
        checkorders.paidAt = req.body.paymentStatus === "paid" ? Date.now() : null; // Set paidAt if paid

          const updatedOrder = await checkorders.save();
          res.json(updatedOrder);
      } else {
          res.status(404).json({ message: "Checkout not found" });
      }
  } catch (error) {
      console.error( error); 
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
        isPaid: false, // Initially set to false
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
      const newCheckout = new checkOut({
        user: userId,
        checkoutItems, 
        shippingAddress,
        paymentMethod,
        totalPrice, 
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
 