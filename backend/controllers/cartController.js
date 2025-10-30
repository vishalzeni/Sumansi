const User = require("../models/User");
const Product = require("../models/Product");

// Get user's cart with product details
exports.getCart = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.id }).select("cart");
    if (!user) return res.status(404).json({ error: "User not found" });

    // Populate product details
    const cartWithProducts = await Promise.all(
      (user.cart || []).map(async (item) => {
        const product = await Product.findOne({ id: item.productId });
        return product
          ? {
              productId: item.productId,
              qty: item.qty || item.quantity || 1,
              size: item.size || "",
              product,
            }
          : null;
      })
    );
    res.json((cartWithProducts || []).filter(Boolean));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Add or update item in cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity, size = "", color = "" } = req.body;
    //store color as well
    
    if (!productId || !quantity || quantity < 1)
      return res.status(400).json({ error: "Product ID and quantity required" });

    const user = await User.findOne({ userId: req.user.id });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Find by productId and size
    const existing = user.cart.find(
      (item) =>
        item.productId.toString() === productId.toString() &&
        (item.size || "") === (size || "") &&
        (item.color || "") === (color || "")
    );
    if (existing) {
      existing.qty = quantity;
      existing.quantity = quantity;
    } else {
      user.cart.push({ productId, qty: quantity, quantity, size, color });
    }
    await user.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Update quantity of a cart item
exports.updateCartItemQuantity = async (req, res) => {
  try {
    const { productId, quantity, size = "" } = req.body;
    if (!productId || !quantity || quantity < 1)
      return res.status(400).json({ error: "Product ID and quantity required" });

    const user = await User.findOne({ userId: req.user.id });
    if (!user) return res.status(404).json({ error: "User not found" });

    const item = user.cart.find(
      (item) =>
        item.productId.toString() === productId.toString() &&
        (item.size || "") === (size || "")
    );
    if (!item)
      return res.status(404).json({ error: "Cart item not found" });

    item.qty = quantity;
    item.quantity = quantity;
    await user.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId, size = "" } = req.body;
    if (!productId)
      return res.status(400).json({ error: "Product ID required" });

    const user = await User.findOne({ userId: req.user.id });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.cart = user.cart.filter(
      (item) =>
        !(item.productId.toString() === productId.toString() &&
          (item.size || "") === (size || ""))
    );
    await user.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.id });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.cart = [];
    await user.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
