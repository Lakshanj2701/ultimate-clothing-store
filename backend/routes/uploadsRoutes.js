// const express = require("express");
// const multer = require("multer");
// const path = require("path");

// const router = express.Router();

// // Set up storage engine for multer
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "uploads/"); // Save images in the 'uploads' directory
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`);
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

// // Configure Multer
// const upload = multer({
//     storage: storage,
//     fileFilter: fileFilter,
//     limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
// });

// // Upload image endpoint
// router.post("/", upload.single("image"), (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({ message: "No file uploaded" });
//     }
//     res.json({ imageUrl: `/uploads/${req.file.filename}` });
// });

// module.exports = router;
