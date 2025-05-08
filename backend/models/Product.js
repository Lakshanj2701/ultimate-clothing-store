const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
  },
  discountPrice: {
    type: Number,
  },
  countInStock: {
    type: Number,
    default: 0,
  },
  sku: {
    type: String,
    unique: true,
  },
  category: {
    type: String,
    enum: ["Men", "Women", "Unisex", "Electronics", "Accessories", "Home", "Sports", "Custom"], // Added predefined categories and a "Custom" option
    default: "Custom", // Default to custom category if not provided
  },
  customDescription: {
    type: String,
    default: "", // Default is empty for products that aren't custom
  },
  brand: {
    type: String,
  },
  sizes: {
    type: [String],
  },
  colors: {
    type: [String],
  },
  collections: {
    type: String,
  },
  material: {
    type: String,
  },
  gender: {
    type: String,
    enum: ["Men", "Women", "Unisex"],
    required: true,
    default: "Unisex",
  },
  images: [{ url: String }], // Store image URLs here

  isFeatured: {
    type: Boolean,
    default: false,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
  tags: [String],
  // metaTitle: {
  //   type: String,
  // },
  // metaDescription: {
  //   type: String,
  // },
  // metaKeywords: {
  //   type: String,
  // },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  weight: Number,
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
