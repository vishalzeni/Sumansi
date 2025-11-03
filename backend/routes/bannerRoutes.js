// filename: bannerRoutes.js
const express = require("express");
const {
  getAllBanners,
  getActiveBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
} = require("../controllers/bannerController");

const router = express.Router();

// ---- API-KEY MIDDLEWARE (admin only) ----
const checkApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (apiKey && apiKey === process.env.ADMIN_API_KEY) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized: Invalid or missing API key" });
  }
};

// PUBLIC
router.get("/active", getActiveBanners);      // /api/banner/active
router.get("/banners", getAllBanners);       // /api/banner/banners

// ADMIN (protected)
router.post("/admin/create", checkApiKey, createBanner);
router.put("/admin/update/:id", checkApiKey, updateBanner);
router.delete("/admin/delete/:id", checkApiKey, deleteBanner);
router.patch("/admin/toggle/:id", checkApiKey, toggleBannerStatus);

module.exports = router;