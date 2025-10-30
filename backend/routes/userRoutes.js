const express = require("express");
const { updateProfile } = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");
const router = express.Router();
const User = require("../models/User");

// GET /api/user/profile (protected)
router.get("/profile", requireAuth, async (req, res) => {
  try {
    // req.user is set by requireAuth middleware
    const user = await User.findOne({ userId: req.user.id });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      userId: user.userId,
      createdAt: user.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/user/profile (protected)
router.put("/profile", requireAuth, updateProfile);

module.exports = router;
