const express = require("express");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// @route   GET /api/admin/products
// @desc    Get all products (Admin only)
// @access  Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   PUT /api/admin/products/:id
// @desc    Update a product (Admin only)
// @access  Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    console.log("Incoming request data:", req.body); // Debugging log

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update product fields
    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.countInStock = req.body.countInStock || product.countInStock;
    product.sku = req.body.sku || product.sku;
    product.category = req.body.category || product.category;
    product.brand = req.body.brand || product.brand;
    product.collections = req.body.collections || product.collections;
    product.material = req.body.material || product.material;
    product.gender = req.body.gender || product.gender;

    // Update arrays (sizes, colors, images)
    product.sizes = req.body.sizes ? JSON.parse(req.body.sizes) : product.sizes;
    product.colors = req.body.colors ? JSON.parse(req.body.colors) : product.colors;
    product.images = req.body.images ? req.body.images : product.images;

    console.log("Updated product data:", product); // Debugging log

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// @route   DELETE /api/admin/products/:id
// @desc    Delete a product (Admin only)
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

module.exports = router;
