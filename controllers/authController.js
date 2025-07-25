const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require("nodemailer");

const { validationResult, check, body } = require('express-validator');

const generateToken = (id) => 
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15d' });


//register
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || name.trim() === "") 
    return res.status(400).json({ message: "Name is required" });

  if (!email || email.trim() === "") 
    return res.status(400).json({ message: "Email is required" });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) 
    return res.status(400).json({ message: "Valid email required" });

  if (!password) 
    return res.status(400).json({ message: "Password is required" });

  if (password.length < 6) 
    return res.status(400).json({ message: "Password must be 6+ chars" });

  try {

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email is already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email && !password) {
    return res.status(400).json({ message: "Email and password required" });
  }
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    user.lastLoginAt = new Date();
    await user.save();

   
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
        lastLoginAt: user.lastLoginAt,
        lastLogoutAt: user.lastLogoutAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//logout
exports.logout = async (req, res) => {
  try {
    const token = req.header("Authorization");
    if (!token) return res.status(400).json({ message: "No token provided" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.lastLogoutAt = new Date();

    if (!user.tokenBlacklist.includes(token)) {
      user.tokenBlacklist.push(token);
    }

    await user.save();

    res.json({ message: "Logged out successfully.",
       lastLogoutAt: user.lastLogoutAt
     });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



//forgot-password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const resetToken = crypto.randomBytes(32).toString("hex");

  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save();

  const resetURL = `${req.protocol}://${req.get("host")}/api/auth/reset-password/${resetToken}`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });


  try {
    await transporter.sendMail({
      from: `"Support Team" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>Hello ${user.name},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetURL}" style="color: blue; text-decoration: underline;">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
      `,
    });

    res.json({ message: "Password reset link sent to your email" });

  } catch (error) {
    console.error("Email sending failed:", error);
    res.status(500).json({ message: "Email could not be sent. Try again later." });
  }
};


//reset Password
exports.resetPassword = async (req, res) => {

  const resetTokenHash = crypto.createHash("sha256").update(req.params.token).digest("hex");
  
  const user = await User.findOne({
    resetPasswordToken: resetTokenHash,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  const { password } = req.body;
  if (!password || password.length < 6) return res.status(400).json({ message: "Password must be 6+ chars" });

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ message: "Password reset successful" });
};
