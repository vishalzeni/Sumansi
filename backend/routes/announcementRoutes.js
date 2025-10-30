const express = require("express");
const router = express.Router();
const Announcement = require("../models/Announcement");

// Get all announcements
router.get("/", async (req, res) => {
  try {
    const announcements = await Announcement.find();
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
});

// Add announcement
router.post("/", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text.trim()) return res.status(400).json({ error: "Text is required" });

    const newAnnouncement = new Announcement({ text });
    await newAnnouncement.save();

    const announcements = await Announcement.find();
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: "Failed to add announcement" });
  }
});

// Delete announcement by ID
router.delete("/:id", async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);

    const announcements = await Announcement.find();
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete announcement" });
  }
});

module.exports = router;
