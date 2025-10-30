const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  marketPrice: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  images: [String],
  sizes: [String],
  inStock: { type: Boolean, default: true },
  description: String,
  isNewArrival: { type: Boolean, default: false },
  reviews: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
  colors: {
    type: [String], // Accepts color names, hex codes, rgb(a) strings
    required: true,
    validate: {
      validator: function (arr) {
        return (
          Array.isArray(arr) &&
          arr.length > 0 &&
          arr.every(
            (c) => typeof c === "string" && c.trim().length > 0
          )
        );
      },
      message: "At least one valid color is required",
    },
  },
});

module.exports = mongoose.model("Product", productSchema);
