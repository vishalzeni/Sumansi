// filename: bannerController.js
const Banner = require("../models/Banner");

// ------------------------------------------------------------------
// GET ALL BANNERS
// ------------------------------------------------------------------
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch banners" });
  }
};

// ------------------------------------------------------------------
// GET ACTIVE BANNERS (public)
// ------------------------------------------------------------------
exports.getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch active banners" });
  }
};

// ------------------------------------------------------------------
// CREATE BANNER – receives Base64 WebP string
// ------------------------------------------------------------------
exports.createBanner = async (req, res) => {
  try {
    const { image, isActive = true, order = 0 } = req.body;

    if (!image || !image.startsWith("data:image/webp;base64,")) {
      return res.status(400).json({ error: "Valid WebP Base64 image required" });
    }

    const banner = new Banner({ image, isActive, order });
    await banner.save();

    res.status(201).json({ message: "Banner created", banner });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create banner" });
  }
};

// ------------------------------------------------------------------
// UPDATE BANNER
// ------------------------------------------------------------------
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.image && !updateData.image.startsWith("data:image/webp;base64,")) {
      return res.status(400).json({ error: "Invalid WebP Base64 image" });
    }

    const banner = await Banner.findByIdAndUpdate(id, updateData, { new: true });
    if (!banner) return res.status(404).json({ error: "Banner not found" });

    res.json({ message: "Banner updated", banner });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update banner" });
  }
};

// ------------------------------------------------------------------
// DELETE BANNER – no Cloudinary cleanup needed
// ------------------------------------------------------------------
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) return res.status(404).json({ error: "Banner not found" });

    res.json({ message: "Banner deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete banner" });
  }
};

// ------------------------------------------------------------------
// TOGGLE ACTIVE STATUS
// ------------------------------------------------------------------
exports.toggleBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);
    if (!banner) return res.status(404).json({ error: "Banner not found" });

    banner.isActive = !banner.isActive;
    await banner.save();

    res.json({ message: "Status toggled", banner });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to toggle status" });
  }
};