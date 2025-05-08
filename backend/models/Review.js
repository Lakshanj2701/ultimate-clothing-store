// models/Review.js
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Prevent users from submitting more than one review per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Static method to get average rating of a product
reviewSchema.statics.getAverageRating = async function (productId) {
  const obj = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  try {
    await mongoose.model("Product").findByIdAndUpdate(productId, {
      rating: obj[0] ? obj[0].averageRating : 0,
      numReviews: obj[0] ? obj[0].reviewCount : 0,
    });
  } catch (err) {
    console.error("Error updating product rating:", err);
  }
};

// Call getAverageRating after save
reviewSchema.post("save", function () {
  this.constructor.getAverageRating(this.product);
});

// Call getAverageRating after remove
reviewSchema.post("remove", function () {
  this.constructor.getAverageRating(this.product);
});

module.exports = mongoose.model("Review", reviewSchema);