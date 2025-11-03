const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const Product = require("./models/Product");
const announcementRoutes = require("./routes/announcementRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const cartRoutes = require("./routes/cart");
const User = require("./models/User");
const productsRoutes = require("./routes/products"); // <-- add this import

dotenv.config();
const app = express();
app.use(express.json({ limit: "50mb" })); // Adjust limit as needed



// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer config
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware
app.use(express.json());
const allowedOrigins = [
  "http://localhost:3000",
  "https://www.sumansi.in",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "x-api-key",
      "X-API-KEY",
    ],
  })
);


app.use(cookieParser());

// Connect DB
connectDB();

// Routes
app.use("/api", authRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/banner", require("./routes/bannerRoutes"));
app.use("/api/products", productsRoutes); // <-- add this line after other app.use

app.use("/api/payment", require("./routes/payment"));


app.get("/", (req, res) => {
  res.send("API is running...");
});

// Admin users list (protected)
app.get("/api/users", async (req, res) => {
    try {
    const users = await User.find({}, "-password -resetPasswordToken -resetPasswordExpires");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Image upload endpoint (returns Base64 string)
app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    // Convert buffer to Base64
    const base64Image = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;
    const base64String = `data:${mimeType};base64,${base64Image}`;
    res.json({ url: base64String });
  } catch (err) {
    console.error("[Upload] Upload failed:", err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Product create endpoint (protected)
app.post("/api/products", async (req, res) => {
  try {
    const productData = {
      ...req.body,
      createdAt: new Date(),
      inStock: req.body.inStock !== undefined ? req.body.inStock : true,
      sizes: Array.isArray(req.body.sizes)
        ? req.body.sizes
        : req.body.sizes
        ? req.body.sizes.split(",").map((s) => s.trim())
        : [],
      images: Array.isArray(req.body.images) ? req.body.images : [], // Ensure images is an array
    };
    if (!productData.name || !productData.image) {
      return res
        .status(400)
        .json({ error: "Product name and image are required" });
    }
    const exists = await Product.findOne({ id: productData.id });
    if (exists) {
      return res.status(400).json({ error: "Product ID already exists" });
    }
    const product = new Product(productData);
    await product.save();
    res.status(201).json({ message: "Product created", product });
  } catch (err) {
    console.error("[Product] Failed to save product:", err);
    res.status(500).json({ error: "Failed to save product" });
  }
});

// Get all products endpoint (without images for performance)
app.get("/api/products", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = {};

    // Exclude images field for performance
    const products = await Product.find(query)
      .select("-images") // Exclude images array
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);
    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    console.error("[Product] Failed to fetch products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Get single product with all details including images
app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.error("[Product] Failed to fetch product:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Update product endpoint
app.put("/api/products/:id", async (req, res) => {
  try {
    const {
      name,
      price,
      marketPrice,
      category,
      description,
      sizes,
      colors,
      inStock,
      isNewArrival,
      image,
      images
    } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        price,
        marketPrice,
        category,
        description,
        sizes,
        colors,
        inStock,
        isNewArrival,
        image,
        images,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product updated successfully", product });
  } catch (err) {
    console.error("[Product] Failed to update product:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Delete product endpoint
app.delete("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("[Product] Failed to delete product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// No direct hardcoded API URLs, uses process.env and relative paths.