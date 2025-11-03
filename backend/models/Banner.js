// filename: models/Banner.js
const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  image: {
    type: String, // now stores data:image/webp;base64,...
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Banner", bannerSchema);