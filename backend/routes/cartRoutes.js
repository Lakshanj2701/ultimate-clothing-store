const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");
const User = require("../models/User");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for custom product image uploads
const customImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = path.join(__dirname, '../uploads/custom_products');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'custom-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
  
  const uploadCustomImage = multer({
    storage: customImageStorage,
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB file size limit
    }
  });
  
// Helper function to get a cart by user ID or guest ID
const getCart = async (userId, guestId) => {


    if (userId) {
        return await Cart.findOne({ user: userId });
    } else if (guestId) {
        return await Cart.findOne({ guestId });
    }
    return null;
};

// @route POST /api/cart
// @desc Add a product to the cart for a guest or logged-in user
// @access Public
router.post("/", uploadCustomImage.single('customImage'), async (req, res) => {
    const { productId, quantity, size, color, description, guestId, userId } = req.body;
  
    try {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: "Product not found" });
  
      // Handle custom image upload
      let customImageUrl = null;
      if (product.category === "Custom" && req.file) {
        customImageUrl = `/uploads/custom_products/${req.file.filename}`;
      }
  
      // Ensure custom description is provided for custom category products
      if (product.category === "Custom" && !description) {
        return res.status(400).json({ message: "Description is required for custom products" });
      }
  
      // Determine if the user is logged in or a guest
      let cart = await getCart(userId, guestId);
  
      // If the cart exists, update it
      if (cart) {
        const productIndex = cart.products.findIndex(
          (p) => p.productId.toString() === productId && p.size === size && p.color === color
        );
  
        if (productIndex > -1) {
          // If the product already exists, update the quantity and description
          cart.products[productIndex].quantity += quantity;
          cart.products[productIndex].description = description || cart.products[productIndex].description;
          if (customImageUrl) {
            cart.products[productIndex].customImage = customImageUrl;
          }
        } else {
          // Add a new product with description if it's a custom product
          cart.products.push({
            productId,
            name: product.name,
            image: product.images[0]?.url || '',
            price: product.price,
            size,
            color,
            quantity,
            description: description || "",
            customImage: customImageUrl
          });
        }
  
        // Recalculate the total price
        cart.totalPrice = cart.products.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
        await cart.save();
        return res.status(200).json(cart);
      } else {
        // Create a new cart for the guest or user
        const newCart = await Cart.create({
          user: userId ? userId : undefined,
          guestId: guestId ? guestId : "guest_" + new Date().getTime(),
          products: [
            {
              productId,
              name: product.name,
              image: product.images[0]?.url || '',
              price: product.price,
              size,
              color,
              quantity,
              description: description || "",
              customImage: customImageUrl
            },
          ],
          totalPrice: product.price * quantity,
        });
  
        return res.status(201).json(newCart);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error" });
    }
});

//@route Put /api/car
//@desc Update product quentity in the cart for a guest or logged-in-user
//@access Public

router.put("/", async (req, res) => {
    const { productId, quantity, size, color, guestId, userId } = req.body;
    try {
        let cart = await getCart(userId, guestId);
        if (!cart) return res.status(404).json({ message: "Cart not found" });

        const productIndex = cart.products.findIndex(
            (p) =>
                p.productId.toString() === productId &&
                p.size === size &&
                p.color === color
        );
        if(productIndex > -1){
            //update quantity
            if(quantity > 0){
                cart.products[productIndex].quantity =  quantity;
            } else {
                cart.products.splice(productIndex, 1); // remove product if quality is 0
            }
            cart.totalPrice = cart.products.reduce((acc, item) => acc + item.price * item.quantity, 0
            );
            await cart.save();
            return res.status(200).json(cart);
        } else {
            return res.status(404).json({message: "Product not found in cart"});
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server Error" });
    }
});

// @route Delete/api/cart
// @desc Remove a product from the cart
//access Public

router.delete("/",async (req, res) => {
    const {productId, size, color, guestId, userId} = req.body;
    try{
        let cart = await getCart(userId, guestId);

        if(!cart) return res.status(404).json({message: "Cart not found"});

        const productIndex = cart.products.findIndex(
            (p) => 
                p.productId.toString() === productId && p.size === size && p.color === color
        );

        if(productIndex > -1){
            cart.products.splice(productIndex, 1);

            cart.totalPrice = cart.products.reduce(
                (acc, item) => acc + item.price * item.quantity,
                0
            );
            await cart.save();
            return res.status(200).json(cart);
        }else {
            return res.status(404).json({message: "Product not found in the cart "});
        }
    }catch (error) { 
        console.error(error);
        return res.status(500).json({message: "Server Error"});
    }
});

// @route GET/api/cart
// @desc Get logged in user' s or guest user, cart
// @access Public
router.get("/", async (req, res) => {
    const { userId, guestId } = req.query;
    try {
        const cart = await getCart(userId, guestId);
        if (cart) {
            res.json(cart);
        } else {
            res.status(404).json({ message: "Cart not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


// @route POST /api/cart/merge
// @desc Merge guest cart into user cart on login
// @access Private
router.post("/merge", protect, async (req, res) => {
    const { guestId } = req.body;

    try {
        // Find the guest cart and user cart
        const guestCart = await Cart.findOne({ guestId });
        const userCart = await Cart.findOne({ user: req.user._id });

        if (guestCart) {
            if (guestCart.products.length === 0){
                return res.status(400).json({message: "Guest cart empty"});
            }
            if(userCart){
                // Merge guest cart into user cart
                guestCart.products.forEach((guestItem) => {
                    const productIndex = userCart.products.findIndex(
                        (item) => 
                            item.productId.toString() === guestItem.productId.toString() &&
                            item.size === guestItem.size && 
                            item.color === guestItem.color
                    );

                    if(productIndex > -1){
                        //if the exists in the user cart, update the quantity
                        userCart.products[productIndex].quantity += guestItem.quantity;
                    } else {
                        //Otherwise add the guest items to the cart
                        userCart.products.push(guestItem);
                    }
                    
                });

                userCart.totalPrice = userCart.products.reduce (
                    (acc, item) => acc + item.price * item.quantity,
                    0
                );
                await userCart.save();

                //remove the guest cart after using
                try {
                    await Cart.findByIdAndDelete({ guestId });
                } catch (error) {
                    console.error("Error deleting this cart:", error);
                }
                res.status(200).json(userCart);
            } else {
                //if the user has no existing cart, assign the guest cart to user
                guestCart.user = req.user._id;
                guestCart.guestId = undefined;
                await guestCart.save();

                res.status(200).json(guestCart);
            }

        } else {
            if (userCart){
                //Guest car has already been merged, return user cart
                return res.status(200).json(userCart);
            }
            res.status(404).json({message: "guest cart not found"});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server Error"})
    }     
});





module.exports = router;
