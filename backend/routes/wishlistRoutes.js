const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const { getWishlistStatus, toggleWishlist, getWishlistProducts } = require("../controllers/wishlistController");

const router = express.Router();

// GET wishlist status of a single product
router.get("/:productId", requireAuth, getWishlistStatus);

// GET all wishlist products for user
router.get("/", requireAuth, getWishlistProducts);

// Toggle wishlist for a product
router.post("/toggle", requireAuth, toggleWishlist);

module.exports = router;
