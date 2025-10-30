const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  userId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  avatar: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  wishlist: {
  type: [String], // productId strings
  default: []
},
  cart: [
    {
      // Allow both ObjectId and String for productId
      productId: { type: String, required: true },
      quantity: { type: Number, default: 1 },
      size: { type: String },
      color: { type: String },
      // Add more fields as needed (e.g., color)
    }
  ],
});

module.exports = mongoose.model("User", userSchema);
