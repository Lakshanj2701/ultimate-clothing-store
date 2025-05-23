const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Product = require("../models/Product");
const Review = require("../models/Review");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// Multer Storage Setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true }); // Ensure directory exists
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Helper function to parse array fields
const parseArrayField = (fieldValue) => {
  if (!fieldValue) return [];
  
  try {
    // If it's already an array, return it
    if (Array.isArray(fieldValue)) return fieldValue;
    
    // If it's a JSON string, parse it
    const parsed = JSON.parse(fieldValue);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (e) {
    // If it's a comma-separated string, split it
    if (typeof fieldValue === 'string') {
      return fieldValue.split(',').map(item => item.trim()).filter(item => item);
    }
    return [fieldValue];
  }
};

// @route POST /api/products
// @desc Create a new Product with Image Upload
// @access Private/Admin
router.post("/", protect, admin, upload.array("images", 5), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collections,
      material,
      gender,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
    } = req.body;

    // Validate category
    const validCategories = ["Men", "Women", "Unisex", "Electronics", "Accessories", "Home", "Sports", "Custom"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category. Please select a valid category." });
    }

    // Parse array fields
    const parsedSizes = parseArrayField(sizes);
    const parsedColors = parseArrayField(colors);
    const parsedTags = parseArrayField(tags);

    // Map uploaded image files to URLs
    const images = req.files.map(file => ({ url: `/uploads/${file.filename}` }));

    const product = new Product({
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      sizes: parsedSizes,
      colors: parsedColors,
      collections,
      material,
      gender,
      images,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isPublished: isPublished === 'true' || isPublished === true,
      tags: parsedTags,
      dimensions,
      weight,
      sku,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// productRoutes.js
router.get("/custom", async (req, res) => {
  try {
    const customProducts = await Product.find({ category: "Custom" });
    res.json(customProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// @route PUT /api/products/:id
// @desc Update an existing product ID
// @access Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
    try {
      // Update logic will go here
      const {
        name,
        description,
        price,
        discountPrice,
        countInStock,
        category,
        brand,
        sizes,
        colors,
        collections,
        material,
        gender,
        images,
        isFeatured,
        isPublished,
        tags,
        dimensions,
        weight,
        sku,
     } = req.body;

     // Find product by ID
    const product = await Product.findById(req.params.id);

    if(product){
        //Update product fields
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.discountPrice = discountPrice || product.discountPrice;
        product.countInStock = countInStock || product.countInStock;
        product.category = category || product.category;
        product.brand = brand || product.brand;
        product.sizes = sizes || product.sizes;
        product.colors = colors || product.colors;
        product.collections = collections || product.collections;
        product.material = material || product.material;
        product.gender = gender || product.gender;
        product.images = images || product.images;
        product.isFeatured = isFeatured !== undefined ? isFeatured : product.isFeatured;
        product.isPublished = isPublished !== undefined ? isPublished : product.isPublished;
        product.tags = tags || product.tags;
        product.dimensions = dimensions || product.dimensions;
        product.weight = weight || product.weight;
        product.sku = sku || product.sku;

        // Save the updated product
        const updatedProduct = await product.save();
        res.json(updatedProduct);

    }else {
        res.status(404).json({ message: "Product not found" });
    }

    
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // @route DELETE /api/products/:id
  // @desc Delete a product by ID
  // @access Private/Admin
  router.delete("/:id", protect, admin, async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (product) {
        await product.deleteOne();
        res.json({ message: "Product removed" });
      } else {
        res.status(404).json({ message: "Product not found" });
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).send("Server Error");
    }
  });


  // @route GET /api/products
  // @desc Get all products with optional query filters
  // @access Public
  router.get("/", async (req, res) => {
    try {
      const {
        collection,
        size,
        color,
        gender,
        minPrice,
        maxPrice,
        sortBy,
        search,
        category,
        material,
        brand,
        limit,
      } = req.query;

      let query = {};
      let sort = {};

      // Filter logic
      if (collection && collection.toLowerCase() !== "all") {
        query.collections = collection;
      }
      if (category && category.toLowerCase() !== "all") {
        query.category = category;
      }
      if (material) {
        query.material = { $in: material.split(",") };
      }
      if (brand) {
        query.brand = { $in: brand.split(",") };
      }
      if (size) {
        query.sizes = { $in: size.split(",") };
      }
      if (color) {
        query.colors = { $in: [color] };
      }
      if (gender) {
        query.gender = gender;
      }

      // Price filtering
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }

      // Search functionality
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      // Sorting logic
      
      if (sortBy) {
        switch (sortBy) {
          case "priceAsc":
            sort = { price: 1 };
            break;
          case "priceDesc":
            sort = { price: -1 };
            break;
          case "popularity":
            sort = { rating: -1 };
            break;
          default:
            break;
        }
      }

      // Fetch products and apply sorting and limit
      const products = await Product.find(query).sort(sort).limit(Number(limit) || 0);

      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Server error" });
    }
  });


  // @route GET /api/products/best-seller
  // @desc Retrieve the product with the highest rating
  // @access Public
  router.get("/best-seller", async (req, res) => {
    try {
      const bestseller = await Product.findOne().sort({ rating: -1 });
  
      if (bestseller) {
        res.json(bestseller);
      } else {
        res.status(404).json({ message: "No best seller found" });
      }
    } catch (error) {
      console.error("Error fetching best seller:", error);
      res.status(500).json({ message: "Server error" });  
    }
  });
  
 
  // @route GET /api/products/new-arrivals
  // @desc Retrieve latest 8 products - Sorted by creation date
  // @access Public
  router.get("/new-arrivals", async (req, res) => {
    try {
      // Fetch latest 8 products
      const newArrivals = await Product.find().sort({ createdAt: -1 }).limit(8);

      res.json(newArrivals);
    } catch (error) {
      console.error("Error fetching new arrivals:", error); 
      res.status(500).json({ message: "Server Error" });
    }
  });




// @route GET /api/products/:id
// @desc Get a single product by ID with reviews
// @access Public
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    const reviews = await Review.find({ product: req.params.id })
      .populate("user", "name")
      .sort("-createdAt");

    if (product) {
      res.json({
        ...product._doc,
        reviews,
      });
    } else {
      res.status(404).json({ message: "Product Not Found" });
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


  // @route GET /api/products/similar/:id
  // @desc Retrieve similar products based on the current product's gender and category
  // @access Public
  router.get("/similar/:id", async (req, res) => {
    const { id } = req.params;
    
    try {
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      const similarProducts = await Product.find({
        _id: { $ne: id }, // Exclude the current product ID
        gender: product.gender,
        category: product.category,
      }).limit(10); // Corrected `.limit()`
  
      res.json(similarProducts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

module.exports = router;
