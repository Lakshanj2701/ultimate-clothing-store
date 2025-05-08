const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware");
const crypto = require("crypto");
const transporter = require("../config/transporter");

const router = express.Router();

// @route POST /api/users/register
// @desc Register a new user
// @access Public
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  console.log(name, email, password);
  
  try {
    // Registration logic
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    user = new User({ name, email, password });
    await user.save();

    // Create JWT Payload
    const payload = { user: { id: user._id, role: user.role } };

    // Sign and return the token along with user data
    jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: "40h" },
        (err, token) => {
        if (err) throw err;
    
        // Send the user and token in response
        res.status(201).json({
            user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            },
            token,
        });
        }
    );
  } catch (error) {
    console.log(error);
    res.status(500).send("Server Error");
  }
});


// @route POST /api/users/login
// @desc Authenticate user
// @access Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    console.log(`Login attempt for: ${email}`);
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    console.log('User found:', user.email);
    console.log('Stored password hash:', user.password);
    
    const isMatch = await user.matchPassword(password);
    console.log(`Password match result: ${isMatch}`);
    
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

       // Create JWT Payload
        const payload = { user: { id: user._id, role: user.role } };

        // Sign and return the token along with user data
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "40h" },
            (err, token) => {
            if (err) throw err;
        
            // Send the user and token in response
            res.json({
                user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                },
                token,
            });
            }
        );
        
      } catch (error) {
        console.error("Login error details:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
      }
  });
  
  // @route GET /api/users/profile
  // @desc Get logged-in user's profile (Protected Route)
  // @access Private
  router.get("/profile", protect, async (req, res) => {
    res.json(req.user);
    });

    // @route POST /api/users/forgot-password
// @desc Request password reset
// @access Public
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    // Save token and expiry to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Create reset URL
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    // Send email
    const mailOptions = {
      to: user.email,
      from: 'sathiradissanayaka80@gmail.com',
      subject: 'Password Reset',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        ${resetUrl}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset link sent to email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route POST /api/users/reset-password/:token
// @desc Reset password
// @access Public
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Password reset token is invalid or has expired" });
    }

    // Set new password - let the pre-save hook handle hashing
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    // Save the user - this will trigger the pre-save hook
    await user.save();

    // Send confirmation email
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Your password has been changed',
      text: `This is a confirmation that the password for your account ${user.email} has just been changed.\n`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

module.exports = router;
