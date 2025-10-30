// filename: bannerController.js
const Banner = require("../models/Banner");
const cloudinary = require("cloudinary").v2; // Import cloudinary

// Get all banners
exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch banners" });
  }
};

// Get active banners only (for frontend display)
exports.getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch active banners" });
  }
};

// Create new banner
exports.createBanner = async (req, res) => {
  try {
    const { image, isActive = true, order = 0 } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Image URL is required" });
    }

    const banner = new Banner({
      image, // Now expects a Cloudinary URL
      isActive,
      order,
    });

    await banner.save();
    res.status(201).json({ message: "Banner created successfully", banner });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create banner" });
  }
};

// Update banner
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.image && !updateData.image.startsWith("http")) {
      return res.status(400).json({ error: "Invalid image URL" });
    }

    const banner = await Banner.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!banner) {
      return res.status(404).json({ error: "Banner not found" });
    }

    res.json({ message: "Banner updated successfully", banner });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update banner" });
  }
};

// Delete banner
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findByIdAndDelete(id);
    
    if (!banner) {
      return res.status(404).json({ error: "Banner not found" });
    }

    // Optionally: Delete image from Cloudinary
    if (banner.image) {
      const publicId = banner.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`sumansi-banners/${publicId}`);
    }

    res.json({ message: "Banner deleted successfully" });
  } catch (err) {
    console.error("[Delete Banner] Error:", err);
    res.status(500).json({ error: "Failed to delete banner" });
  }
};

// Toggle banner active status
exports.toggleBannerStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ error: "Banner not found" });
    }

    banner.isActive = !banner.isActive;
    await banner.save();

    res.json({ message: "Banner status updated", banner });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to toggle banner status" });
  }
};