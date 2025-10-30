const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");
const Product = require("../models/Product");

router.post('/:id/reviews', requireAuth, authController.addProductReview);

router.get('/gallery-products', async (req, res) => {
  try {
    // Optional query param for number of products per category (default: 10)
    const perCategory = parseInt(req.query.per_category) || 10;

    // Aggregation pipeline to:
    // 1. Sort by newest first (optional, remove if not needed)
    // 2. Group by category
    // 3. Limit products per category
    // 4. Project only needed fields
    const grouped = await Product.aggregate([
      { $sort: { createdAt: -1 } }, // Newest products first
      {
        $group: {
          _id: '$category',
          products: {
            $push: {
              id: '$id',
              name: '$name',
              price: '$price',
              marketPrice: '$marketPrice',
              category: '$category',
              image: '$image',
              sizes: '$sizes',
              colors: '$colors',
            },
          },
        },
      },
      { $project: { products: { $slice: ['$products', perCategory] } } }, // Limit to perCategory products
      { $sort: { _id: -1 } }, // Sort categories alphabetically
    ]);

    // Flatten the products array to match frontend's expected format
    const products = grouped.flatMap((group) => group.products);

    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Route to fetch new arrival products for the carousel
router.get('/new-arrivals', async (req, res) => {
  try {
    // Optional query param for number of products (default: 12)
    const limit = parseInt(req.query.limit) || 12;

    // Fetch products where isNewArrival is true, sorted by newest first
    // Project only the fields used in NewArrivalsCarousel: id, name, image, isNewArrival
    const products = await Product.find({ isNewArrival: true })
      .select('id name image isNewArrival')
      .sort({ createdAt: -1 }) // Newest first
      .limit(limit)
      .lean(); // Convert to plain JS objects for faster response

    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to get all unique categories
router.get("/categories", async (req, res) => {
  try {
    // Only get non-null, non-empty categories
    const categories = await Product.distinct("category", { category: { $exists: true, $ne: "" } });
    res.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/new-arrivalsPage", async (req, res) => {
  try {
    // Fetch only products that are marked as new arrivals
    // You can also limit the number of results if needed
    const limit = parseInt(req.query.limit) || 20; // optional query param
    const products = await Product.find({
      isNewArrival: true,
      image: { $exists: true, $ne: "" },
      name: { $exists: true, $ne: "" },
    })
      .sort({ createdAt: -1 }) // newest first
      .limit(limit)
      .select(
        "id name price marketPrice category image images sizes colors inStock description"
      ); // return only necessary fields

    res.json({ products });
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/productsDetail", async (req, res) => {
  try {
    const { id } = req.query; // Get product ID from query parameter

    if (!id) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    // Fetch all products or a specific product by ID
    const products = await Product.find({ id }).lean(); // Use lean() for better performance
    if (!products || products.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Return products array to match frontend expectation
    res.status(200).json({ products });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;