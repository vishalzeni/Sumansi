require('dotenv').config(); // <-- Add this line at the very top

const User = require("../models/User");
const Product = require("../models/Product"); // <-- import Product model
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Configure nodemailer transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP connection at startup
transporter.verify(function(error, success) {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("SMTP server is ready to take our messages");
  }
});

// Utility function to send email with error logging
const sendMail = async ({ to, subject, html }) => {
  console.log(`[Mail] Attempting to send mail to ${to} with subject "${subject}"`);
  try {
    const info = await transporter.sendMail({
      from: '"Sumansi" <info@sumansi.in>',
      to,
      subject,
      
      html,
    });
    console.log(`[Mail] Successfully sent mail to ${to} with subject "${subject}"`);
    console.log(`[Mail] MessageId: ${info.messageId}`);
    console.log(`[Mail] Accepted: ${info.accepted}`);
    console.log(`[Mail] Rejected: ${info.rejected}`);
    // Optionally, log the full info object for debugging
    // console.log(info);
  } catch (err) {
    console.error(`[Mail] Failed to send mail to ${to} with subject "${subject}". Error:`, err);
  }
};

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || "7d";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your_super_refresh_secret_here";
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || "7d";

// Warn if secrets are missing
if (!JWT_SECRET) {
  console.warn("JWT_SECRET is missing from environment variables.");
}

// Generate access token only
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, userId: user.userId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
};

// Generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, userId: user.userId },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRY }
  );
};

// Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password)
      return res.status(400).json({ error: "All fields required" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const { nanoid } = await import('nanoid');
    const userId = nanoid(12);
    const user = new User({ name, email, phone, password: hashedPassword, userId });
    await user.save();

    // Send welcome email
    const now = new Date();
    await sendMail({
      to: email,
      subject: "Welcome to Sumansi!",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;background:#faf7ff;border-radius:12px;border:1px solid #eee;">
          <h2 style="color:#7a4eab;">Welcome, ${name}!</h2>
          <p>Thank you for signing up at <b>Sumansi</b>.<br/>
          We're excited to have you join our family.</p>
          <p style="margin:18px 0 8px 0;">Your account details:</p>
          <ul>
            <li><b>Name:</b> ${name}</li>
            <li><b>Email:</b> ${email}</li>
            <li><b>Phone:</b> ${phone}</li>
            <li><b>Registration Date:</b> ${now.toLocaleString()}</li>
          </ul>
          <p style="margin-top:24px;">Happy Shopping!<br/>Team Sumansi</p>
          <hr style="margin:24px 0;border:none;border-top:1px solid #eee;">
          <small style="color:#888;">If you did not sign up, please ignore this email.</small>
        </div>
      `,
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: "User registered successfully",
      accessToken,
      user: { _id: user._id, name, email, phone, createdAt: user.createdAt, userId: user.userId },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // Send login notification email
    const now = new Date();
    await sendMail({
      to: user.email,
      subject: "Login Notification - Sumansi",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;background:#faf7ff;border-radius:12px;border:1px solid #eee;">
          <h2 style="color:#7a4eab;">Hello, ${user.name}!</h2>
          <p>Your account was just logged in at <b>Sumansi</b>.</p>
          <ul>
            <li><b>Email:</b> ${user.email}</li>
            <li><b>Login Date & Time:</b> ${now.toLocaleString()}</li>
          </ul>
          <p style="margin-top:24px;">If this wasn't you, please reset your password immediately.</p>
          <hr style="margin:24px 0;border:none;border-top:1px solid #eee;">
          <small style="color:#888;">This is an automated notification from Sumansi.</small>
        </div>
      `,
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: "Login successful",
      accessToken,
      user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, userId: user.userId },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "No user found with that email" });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 30; // 30 minutes
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL || "https://sumansi.in"}/reset-password/${resetToken}`;
    await sendMail({
      to: user.email,
      subject: "Password Reset - Sumansi",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;background:#faf7ff;border-radius:12px;border:1px solid #eee;">
          <h2 style="color:#7a4eab;">Password Reset Request</h2>
          <p>Hello, ${user.name}.<br/>
          We received a request to reset your password for your Sumansi account.</p>
          <p>
            <a href="${resetUrl}" style="background:#7a4eab;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:bold;">Reset Password</a>
          </p>
          <p>This link will expire in 30 minutes.</p>
          <hr style="margin:24px 0;border:none;border-top:1px solid #eee;">
          <small style="color:#888;">If you did not request this, please ignore this email.</small>
        </div>
      `,
    });

    res.json({ message: "Password reset link sent to your email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const resetTokenHash = require("crypto").createHash("sha256").update(token).digest("hex");
    console.log("Reset token:", token);
    console.log("Hashed token:", resetTokenHash);

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });
    console.log("User found for reset:", user);

    if (!user) return res.status(400).json({ error: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    await sendMail({
      to: user.email,
      subject: "Password Changed - Sumansi",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;background:#faf7ff;border-radius:12px;border:1px solid #eee;">
          <h2 style="color:#7a4eab;">Password Changed</h2>
          <p>Hello, ${user.name}.<br/>
          Your password has been changed successfully.</p>
          <hr style="margin:24px 0;border:none;border-top:1px solid #eee;">
          <small style="color:#888;">If you did not do this, please contact support immediately.</small>
        </div>
      `,
    });

    res.json({ message: "Password has been reset successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, avatar } = req.body;

    // Validate userId
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Find user by userId field in your schema
    const user = await User.findOne({ userId: userId }); // ✅ Using userId instead of _id
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      avatar: updatedUser.avatar,
      userId: updatedUser.userId,
      createdAt: updatedUser.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Add review to product
exports.addProductReview = async (req, res) => {
  try {
    const productId = req.params.id;
    const { rating, comment, userId, userName, userAvatar } = req.body;
    if (!rating || !comment || !userId || !userName) {
      return res.status(400).json({ error: "All fields required" });
    }
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const review = {
      rating,
      comment,
      userId,
      userName,
      userAvatar,
      date: new Date(),
    };
    product.reviews.push(review);
    await product.save();
    res.json({ message: "Review added", review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};




