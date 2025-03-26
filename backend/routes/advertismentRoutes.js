const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Advertisement = require("../models/Advertisement");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// Multer Storage Setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "../uploads/advertisements");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true }); 
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
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

// Debugging Middleware
router.use((req, res, next) => {
  console.log(`Received ${req.method} request to ${req.path}`);
  console.log('Request Body:', req.body);
  console.log('Request Files:', req.files);
  next();
});

// @route   POST /api/admin/advertisements
// @desc    Create a new advertisement (Admin only)
// @access  Private/Admin
router.post("/", protect, admin, upload.single("image"), async (req, res) => {
  try {
    // Detailed logging
    console.log("Full Request Body:", req.body);
    console.log("Uploaded File:", req.file);

    const { title, description, discountAmount, startDate, endDate } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ 
        message: "Title and description are required" 
      });
    }

    // Parse dates with fallback
    const parsedStartDate = startDate ? new Date(startDate) : new Date();
    const parsedEndDate = endDate 
      ? new Date(endDate) 
      : new Date(parsedStartDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from start

    // Parse discount amount
    const parsedDiscountAmount = discountAmount 
      ? parseFloat(discountAmount) 
      : 0;

    if (isNaN(parsedDiscountAmount)) {
      return res.status(400).json({ 
        message: "Invalid discount amount" 
      });
    }

    const advertisement = new Advertisement({
      title,
      description,
      discountAmount: parsedDiscountAmount,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      image: req.file 
        ? `/uploads/advertisements/${req.file.filename}` 
        : null
    });

    const createdAdvertisement = await advertisement.save();
    
    res.status(201).json(createdAdvertisement);
  } catch (error) {
    console.error("Detailed Error creating advertisement:", error);
    
    res.status(500).json({ 
      message: "Failed to create advertisement", 
      error: error.message,
      stack: error.stack 
    });
  }
});

// @route   GET /api/admin/advertisements
// @desc    Get all advertisements (Admin only)
// @access  Private/Admin
router.get("/", protect, admin, async (req, res) => {
  try {
    const advertisements = await Advertisement.find({});
    res.json(advertisements);
  } catch (error) {
    console.error("Error fetching advertisements:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   GET /api/admin/advertisements/:id
// @desc    Get a single advertisement (Admin only)
// @access  Private/Admin
router.get("/:id", protect, admin, async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id);

    if (!advertisement) {
      return res.status(404).json({ message: "Advertisement not found" });
    }

    res.json(advertisement);
  } catch (error) {
    console.error("Error fetching advertisement:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   PUT /api/admin/advertisements/:id
// @desc    Update an advertisement (Admin only)
// @access  Private/Admin
router.put("/:id", protect, admin, upload.single("image"), async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id);

    if (!advertisement) {
      return res.status(404).json({ message: "Advertisement not found" });
    }

    // Update basic advertisement fields
    advertisement.title = req.body.title || advertisement.title;
    advertisement.description = req.body.description || advertisement.description;
    advertisement.discountAmount = req.body.discountAmount 
      ? parseFloat(req.body.discountAmount) 
      : advertisement.discountAmount;
    
    // Update dates if provided
    if (req.body.startDate) {
      advertisement.startDate = new Date(req.body.startDate);
    }
    if (req.body.endDate) {
      advertisement.endDate = new Date(req.body.endDate);
    }

    // Handle image upload
    if (req.file) {
      // Optional: Delete previous image if it exists
      if (advertisement.image) {
        const oldImagePath = path.join(__dirname, `..${advertisement.image}`);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Update with new image
      advertisement.image = `/uploads/advertisements/${req.file.filename}`;
    }

    const updatedAdvertisement = await advertisement.save();
    res.json(updatedAdvertisement);
  } catch (error) {
    console.error("Error updating advertisement:", error);
    res.status(500).json({ message: "Failed to update advertisement" });
  }
});

// @route   DELETE /api/admin/advertisements/:id
// @desc    Delete an advertisement (Admin only)
// @access  Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const advertisement = await Advertisement.findById(req.params.id);

    if (!advertisement) {
      return res.status(404).json({ message: "Advertisement not found" });
    }

    // Optional: Delete associated image file
    if (advertisement.image) {
      const imagePath = path.join(__dirname, `..${advertisement.image}`);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await advertisement.deleteOne();
    res.json({ message: "Advertisement deleted successfully" });
  } catch (error) {
    console.error("Error deleting advertisement:", error);
    res.status(500).json({ message: "Failed to delete advertisement" });
  }
});

module.exports = router;