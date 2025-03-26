// const express = require("express");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// const router = express.Router();

// // Ensure "uploads" folder exists
// const uploadDir = path.join(__dirname, "../uploads");
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Set up storage engine for multer
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, uploadDir); // Save images in the 'uploads' directory
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`); // Add timestamp to image name
//     }
// });

// // File type validation
// const fileFilter = (req, file, cb) => {
//     const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
//     if (allowedTypes.includes(file.mimetype)) {
//         cb(null, true);
//     } else {
//         cb(new Error("Only JPEG, JPG, and PNG images are allowed"), false);
//     }
// };

// // Configure Multer for single file upload
// const upload = multer({
//     storage: storage,
//     fileFilter: fileFilter,
//     limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
// });

// // @route POST /api/uploads
// // @desc Upload an image
// // @access Public
// router.post("/", upload.array("image", 5), (req, res) => {
//   try {
//       if (!req.files || req.files.length === 0) {
//           return res.status(400).json({ message: "No file uploaded" });
//       }

//       const baseURL = `${process.env.BASE_URL}:${process.env.PORT}`;
//       const imageUrls = req.files.map(file => `${baseURL}/uploads/${file.filename}`);
      
//       res.json({ imageUrls });
//   } catch (error) {
//       console.error("Error uploading images:", error);
//       res.status(500).json({ message: "Image upload failed" });
//   }
// });


// module.exports = router;
