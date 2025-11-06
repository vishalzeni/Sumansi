const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { body, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const { requireAuth } = require("../middleware/authMiddleware");
const FIRST_ORDER_PROMO_CODE = process.env.PROMO_CODE;

if (!FIRST_ORDER_PROMO_CODE) {
  console.warn("⚠️ Warning: PROMO_CODE environment variable is not set!");
}
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests
  message: "Too many requests, please try again later.",
});

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_key",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "rzp_test_secret",
});

// Order Schema (assuming MongoDB)
const orderSchema = new mongoose.Schema({
  razorpayOrderId: String,
  paymentId: String,
  status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
  items: [
    {
      productId: String,
      name: String,
      price: Number,
      qty: Number,
      size: String,
    },
  ],
  shippingAddress: {
    fullName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String,
  },
  totalAmount: Number,
  paymentMethod: { type: String, enum: ["online", "COD"], default: "online" },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Input validation middleware
const validateOrder = [
  body("amount").isFloat({ min: 1 }).withMessage("Invalid amount"),
  body("currency").equals("INR").withMessage("Currency must be INR"),
  body("receipt").notEmpty().withMessage("Receipt is required"),
];

const validatePayment = [
  body("razorpay_order_id").notEmpty().withMessage("Order ID is required"),
  body("razorpay_payment_id").notEmpty().withMessage("Payment ID is required"),
  body("razorpay_signature").notEmpty().withMessage("Signature is required"),
  body("orderDetails.items").isArray({ min: 1 }).withMessage("At least one item is required"),
  body("orderDetails.shippingAddress").isObject().withMessage("Shipping address is required"),
  body("orderDetails.totalAmount").isFloat({ min: 1 }).withMessage("Invalid total amount"),
];

// Add a new validation middleware for COD orders
const validateCODOrder = [
  body("items").isArray({ min: 1 }).withMessage("At least one item is required"),
  body("shippingAddress").isObject().withMessage("Shipping address is required"),
  body("totalAmount").isFloat({ min: 1 }).withMessage("Invalid total amount"),
];

// Create Razorpay order
router.post("/create-order", paymentLimiter, validateOrder, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Validation failed", errors: errors.array() });
  }

  try {
    const { amount, currency, receipt } = req.body;
    const options = {
      amount: amount * 100, // Convert to paise
      currency,
      receipt,
    };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ message: "Order creation failed", error: err.message });
  }
});

// Verify payment and save order
router.post("/verify-payment", paymentLimiter, validatePayment, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Validation failed", errors: errors.array() });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderDetails } = req.body;

    // Verify signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Save order to database
    const order = await Order.create({
      razorpayOrderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      status: "completed",
      items: orderDetails.items.map((item) => ({
        productId: item.productId,
        name: item.product.name || "Unknown Product",
        price: item.product.price || 0,
        qty: item.qty || 1,
        size: item.size || "N/A",
      })),
      shippingAddress: {
        fullName: orderDetails.shippingAddress.fullName,
        email: orderDetails.shippingAddress.email,
        phone: orderDetails.shippingAddress.phone,
        address: orderDetails.shippingAddress.address,
        city: orderDetails.shippingAddress.city,
        state: orderDetails.shippingAddress.state,
        pincode: orderDetails.shippingAddress.pincode,
        landmark: orderDetails.shippingAddress.landmark || "",
      },
      totalAmount: orderDetails.totalAmount,
      paymentMethod: "online",
    });

    // Prepare email content
    const itemsHtml = order.items
      .map(
        (item) =>
          `<li><strong>${item.name}</strong> (Qty: ${item.qty}, Size: ${item.size}) - ₹${item.price}, Color: ${item.color || "N/A"}</li>`
      )
      .join("");

    const mailOptions = {
      from: `"Sumansi" <${process.env.SMTP_USER}>`,
      to: [orderDetails.shippingAddress.email, "siyat211@gmail.com"], // Notify customer and admin
      subject: `Order Confirmation: ${razorpay_order_id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #d84315;">Order Confirmation</h2>
          <p>Thank you for your order!</p>
          <p><strong>Order ID:</strong> ${razorpay_order_id}</p>
          <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
          <h3 style="color: #333;">Shipping Details:</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Name:</strong> ${orderDetails.shippingAddress.fullName}</li>
            <li><strong>Email:</strong> ${orderDetails.shippingAddress.email}</li>
            <li><strong>Phone:</strong> ${orderDetails.shippingAddress.phone}</li>
            <li><strong>Address:</strong> ${orderDetails.shippingAddress.address}, ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state}, ${orderDetails.shippingAddress.pincode}</li>
            <li><strong>Landmark:</strong> ${orderDetails.shippingAddress.landmark || "N/A"}</li>
          </ul>
          <h3 style="color: #333;">Order Items:</h3>
          <ul>${itemsHtml}</ul>
          <p><strong>Total Amount:</strong> ₹${orderDetails.totalAmount}</p>
          <p style="color: #777;">We'll notify you once your order is shipped.</p>
        </div>
      `,
    };

    // Send email
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Email error:", err);
        // Log to monitoring service (e.g., Sentry)
      }
    });

    res.json({ orderId: razorpay_order_id, paymentId: razorpay_payment_id });
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ message: "Payment verification failed", error: err.message });
  }
});

// Create COD order
router.post("/create-cod-order", paymentLimiter, validateCODOrder, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Validation failed", errors: errors.array() });
  }

  try {
    const { items, shippingAddress, totalAmount } = req.body;

    // Save COD order to database
    const order = await Order.create({
      razorpayOrderId: `cod_${Date.now()}`,
      status: "pending",
      items: items.map((item) => ({
        productId: item.productId,
        name: item.name || item.product?.name || "Unknown Product",
        price: item.price || item.product?.price || 0,
        qty: item.qty || 1,
        size: item.size || "N/A",
      })),
      shippingAddress,
      totalAmount,
      paymentMethod: "COD",
    });

    // Prepare email content
    const itemsHtml = order.items
      .map(
        (item) =>
          `<li><strong>${item.name}</strong> (Qty: ${item.qty}, Size: ${item.size}) - ₹${item.price}, Color: ${item.color || "N/A"}</li>`
      )
      .join("");

    const mailOptions = {
      from: `"Sumansi" <${process.env.SMTP_USER}>`,
      to: [shippingAddress.email, "vishalzenith47@gmail.com"],
      subject: `A New COD Order ${order.razorpayOrderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #d84315;">There is a new COD order.</h2>
          <p><strong>Order ID:</strong> ${order.razorpayOrderId}</p>
          <h3 style="color: #333;">Shipping Details:</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Name:</strong> ${shippingAddress.fullName}</li>
            <li><strong>Email:</strong> ${shippingAddress.email}</li>
            <li><strong>Phone:</strong> ${shippingAddress.phone}</li>
            <li><strong>Address:</strong> ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.pincode}</li>
            <li><strong>Landmark:</strong> ${shippingAddress.landmark || "N/A"}</li>
          </ul>
          <h3 style="color: #333;">Order Items:</h3>
          <ul>${itemsHtml}</ul>
          <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
          <p style="color: #777;">We'll notify you once your order is shipped.</p>
        </div>
      `,
    };

    // Send email
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Email error:", err);
        // Log to monitoring service
      }
    });

    res.json({ orderId: order.razorpayOrderId });
  } catch (err) {
    console.error("COD order error:", err);
    res.status(500).json({ message: "Failed to place COD order", error: err.message });
  }
});

// Get orders by user email (or other query params)
// Example: GET /api/payment/orders?email=user%40example.com
router.get("/orders", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "email query param is required" });

    // Search orders where shippingAddress.email matches the provided email
    const orders = await Order.find({ "shippingAddress.email": email }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Failed to fetch orders:", err);
    res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
});

// Admin: get all orders (no email filter)
// Example: GET /api/payment/all-orders
router.get("/all-orders", async (req, res) => {
  try {
    // In a real app you should protect this route (admin auth)
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Failed to fetch all orders:", err);
    res.status(500).json({ message: "Failed to fetch all orders", error: err.message });
  }
});

router.get('/first-order-status', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user has any previous completed orders
    const existingOrders = await Order.find({ 
      'shippingAddress.email': req.user.email, // Use email from shipping address
      status: { $nin: ['cancelled', 'failed'] }
    });

    const isFirstOrder = existingOrders.length === 0;

    res.json({
      isFirstOrder,
      message: isFirstOrder 
        ? 'This is your first order - eligible for welcome discount!' 
        : 'Welcome back!'
    });

  } catch (error) {
    console.error('First order check error:', error);
    res.status(500).json({ 
      message: 'Server error checking order status',
      error: error.message 
    });
  }
});

router.post('/validate-promo', requireAuth, async (req, res) => {
  try {
    const { promoCode, subtotal } = req.body;

    // Check if user has any previous completed orders
    const existingOrders = await Order.find({ 
      'shippingAddress.email': req.user.email,
      status: { $nin: ['cancelled', 'failed'] }
    });

    const isFirstOrder = existingOrders.length === 0;

    // Validate promo code
    if (!promoCode || typeof promoCode !== 'string') {
      return res.status(400).json({
        valid: false,
        message: 'Please enter a valid promo code'
      });
    }

    const cleanedPromoCode = promoCode.trim().toUpperCase();

    // Check for first order promo code
    if (cleanedPromoCode === "FIRSTSUMANSI") {
      if (!isFirstOrder) {
        return res.status(400).json({
          valid: false,
          message: 'This promo code is only valid for first-time customers'
        });
      }

      // Calculate 10% discount
      const discountAmount = Math.round(subtotal * 0.1);
      const discountedTotal = subtotal - discountAmount;

      return res.json({
        valid: true,
        promoCode: "FIRSTSUMANSI",
        discountAmount,
        discountedTotal,
        discountPercentage: 10,
        message: '10% welcome discount applied successfully!'
      });
    }

    // Agar koi aur promo code hai toh invalid batao
    return res.status(400).json({
      valid: false,
      message: 'Invalid promo code'
    });

  } catch (error) {
    console.error('Promo code validation error:', error);
    res.status(500).json({ 
      message: 'Server error validating promo code',
      error: error.message 
    });
  }
});

module.exports = router;
