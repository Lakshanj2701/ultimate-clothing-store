// routes/reviewRoutes.js
const express = require("express");
const { protect, admin } = require("../middleware/authMiddleware");
const Review = require("../models/Review");
const Product = require("../models/Product");

const router = express.Router();

// @route    POST /api/reviews/:productId
// @desc     Create a new review
// @access   Private
router.post("/:productId", protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.productId;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user already reviewed this product
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      product: productId,
    });

    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ message: "You have already reviewed this product" });
    }

    // Create review
    const review = new Review({
      user: req.user._id,
      product: productId,
      rating: Number(rating),
      comment,
    });

    await review.save();

    res.status(201).json({
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route    GET /api/reviews/product/:productId
// @desc     Get all reviews for a product
// @access   Public
// In your backend review routes (reviewRoutes.js)
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name _id") // Make sure to include _id
      .sort("-createdAt");

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route    GET /api/reviews/admin/product/:productId
// @desc     Get all reviews for a product (Admin)
// @access   Private/Admin
router.get("/admin/product/:productId", protect, admin, async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name email")
      .sort("-createdAt");

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route    PUT /api/reviews/:reviewId
// @desc     Update a review
// @access   Private (only review owner can update)
router.put("/:reviewId", protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user is the review owner
    if (review.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "Not authorized to update this review" });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    review.updatedAt = Date.now();

    const updatedReview = await review.save();

    res.json({
      message: "Review updated successfully",
      review: updatedReview,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route    DELETE /api/reviews/:reviewId
// @desc     Delete a review
// @access   Private (only review owner or admin can delete)
router.delete("/:reviewId", protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user is the review owner or admin
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this review" });
    }

    await review.deleteOne();

    res.json({ message: "Review removed successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;