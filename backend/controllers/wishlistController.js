const User = require("../models/User");
const Product = require("../models/Product");

exports.getWishlistStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findOne({ userId: req.user.id }).select("wishlist");

    if (!user) return res.status(404).json({ error: "User not found" });

    const wishlisted = user.wishlist.includes(productId);
    res.json({ wishlisted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }
    const user = await User.findOne({ userId: req.user.id }).select("wishlist");

    if (!user) return res.status(404).json({ error: "User not found" });

    let update;
    let wishlisted;
    if (user.wishlist.includes(productId)) {
      update = { $pull: { wishlist: productId } };
      wishlisted = false;
    } else {
      update = { $addToSet: { wishlist: productId } };
      wishlisted = true;
    }

    await User.updateOne({ userId: req.user.id }, update);
    res.json({ wishlisted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getWishlistProducts = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.id }).select("wishlist");
    if (!user) return res.status(404).json({ error: "User not found" });

    // Find products by wishlist IDs
    const products = await Product.find({ id: { $in: user.wishlist } });
    // Return as array of { product } for frontend compatibility
    res.json(products.map(product => ({ product })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
