const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const cartController = require("../controllers/cartController");

const router = express.Router();

router.get("/", requireAuth, cartController.getCart);
router.post("/add", requireAuth, cartController.addToCart);
router.post("/remove", requireAuth, cartController.removeFromCart);
router.post("/clear", requireAuth, cartController.clearCart);
router.post('/update-quantity', requireAuth, cartController.updateCartItemQuantity);
module.exports = router;
