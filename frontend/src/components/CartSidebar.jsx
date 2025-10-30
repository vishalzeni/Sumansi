import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Divider,
  Chip,
  Stack,
  Paper,
  CircularProgress,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
  TextField,
  Checkbox,
  FormControlLabel,
  Tooltip,
  Skeleton,
  Snackbar,
  Alert
} from "@mui/material";
import { useCart } from "../hooks/useCart";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import { Link } from "react-router-dom";
import colors from "../colors";
import { motion, AnimatePresence } from "framer-motion";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CloseIcon from "@mui/icons-material/Close";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import DiscountIcon from "@mui/icons-material/Discount";
import SecurityIcon from "@mui/icons-material/Security";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import StarIcon from "@mui/icons-material/Star";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ShieldIcon from "@mui/icons-material/Shield";
import { useNavigate } from "react-router-dom";


const CartSidebar = ({ open, onClose }) => {
  const {
    cartItems = [],
    removeFromCart = () => {},
    clearCart = () => {},
    loading = false,
    updateQuantity = () => {},
  } = useCart() || {};

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [giftWrap, setGiftWrap] = useState(false);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const formatIndianNumber = (num) => {
    if (!num) return "0";
    return num.toLocaleString("en-IN");
  };

      const giftWrapCost = giftWrap ? 50 : 0;

  const { total, marketTotal, totalSavings, finalTotal } = useMemo(() => {
    const total = cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.qty || 1),
      0
    );
    const marketTotal = cartItems.reduce(
      (sum, item) => sum + (item.marketPrice || item.price || 0) * (item.qty || 1),
      0
    );
    const totalSavings = marketTotal - total;
    const promoDiscount = promoCode === "SAVE10" ? Math.round(total * 0.1) : 0;
    return {
      total,
      marketTotal,
      totalSavings,
      finalTotal: total + giftWrapCost - promoDiscount,
    };
  }, [cartItems, giftWrap, promoCode]);

  const handleQuantityChange = async (productId, size, newQty) => {
    if (newQty < 1) return;
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      setError("Please log in to update cart");
      window.location.href = "/login";
      return;
    }
    try {
      await updateQuantity(productId, newQty, size);
    } catch {
      setError("Failed to update quantity. Please try again.");
    }
  };

  const handleRemoveFromCart = async (productId, size) => {
    try {
      await removeFromCart(productId, size);
    } catch {
      setError("Failed to remove item. Please try again.");
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch {
      setError("Failed to clear cart. Please try again.");
    }
  };

  const handleApplyPromo = () => {
    if (!promoCode) {
      setError("Please enter a promo code");
      return;
    }
    if (promoCode !== "SAVE10") {
      setError("Invalid promo code");
      return;
    }
    setError(null);
  };

  const calculateDiscountPercentage = (marketPrice, sellingPrice) => {
    if (!marketPrice || marketPrice <= sellingPrice) return 0;
    return Math.round(((marketPrice - sellingPrice) / marketPrice) * 100);
  };

  const PriceRow = ({ label, value, highlight = false, disabled = false, color, icon }) => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        opacity: disabled ? 0.5 : 1,
        py: 0.5,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: color || colors.icon,
          fontWeight: highlight ? 600 : 400,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {icon}
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: color || (highlight ? colors.primary : colors.icon),
          fontWeight: highlight ? 700 : 500,
        }}
      >
        {value}
      </Typography>
    </Box>
  );

  const TrustBadge = ({ icon, label }) => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      cursor: 'default',
      pointerEvents: 'none'
    }}>
      <Box sx={{ 
        color: colors.primary, 
        mb: 0.5, 
        fontSize: '1.2rem',
        backgroundColor: `${colors.primary}10`,
        borderRadius: '50%',
        p: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </Box>
      <Typography variant="caption" sx={{ 
        color: colors.icon, 
        textAlign: 'center', 
        fontSize: '0.7rem',
        fontWeight: 500
      }}>
        {label}
      </Typography>
    </Box>
  );

  const CheckoutPopup = ({ open, onClose }) => {
    return (
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: colors.background,
            boxShadow: `0 8px 32px ${colors.primary}20`,
            overflow: 'hidden',
            maxHeight: '90vh',
          }
        }}
        TransitionComponent={motion.div}
        transitionProps={{
          initial: { opacity: 0, y: 50 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 50 },
          transition: { duration: 0.3 }
        }}
      >
        <DialogTitle sx={{ 
          m: 0, 
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: colors.primary,
          color: colors.badgeText,
        }}>
          <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalOfferIcon />
            Complete Your Order
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: colors.badgeText,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 0, backgroundColor: colors.background }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, minHeight: isMobile ? 'auto' : 500 }}>
            {/* Left Side - Order Details */}
            <Box sx={{ 
              flex: 1, 
              p: 3, 
              borderRight: { md: `1px solid ${colors.border}` },
              borderBottom: { xs: `1px solid ${colors.border}`, md: 'none' }
            }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: colors.primary, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShoppingCartIcon />
                Order Summary ({cartItems.length} items)
              </Typography>

              {/* Price Breakdown */}
              <Box sx={{ mb: 3, p: 2, backgroundColor: `${colors.accent}50`, borderRadius: 2 }}>
                <PriceRow
                  label="Subtotal"
                  value={`₹${formatIndianNumber(total)}`}
                />
                
                <PriceRow
                  label="Market Price"
                  value={`₹${formatIndianNumber(marketTotal)}`}
                  color={colors.icon}
                />

                {totalSavings > 0 && (
                  <PriceRow
                    label={`You Save (${Math.round((totalSavings/marketTotal) * 100)}% OFF)`}
                    value={`-₹${formatIndianNumber(totalSavings)}`}
                    highlight
                    color="#4caf50"
                    icon={<DiscountIcon sx={{ fontSize: 16 }} />}
                  />
                )}

                <PriceRow 
                  label="Shipping" 
                  value="FREE" 
                  color="#4caf50"
                  icon={<LocalShippingIcon sx={{ fontSize: 16 }} />}
                />

                {giftWrap && (
                  <PriceRow
                    label="Gift Wrapping"
                    value={`₹${giftWrapCost}`}
                    icon={<FlashOnIcon sx={{ fontSize: 16 }} />}
                  />
                )}

                {promoCode === "SAVE10" && (
                  <PriceRow
                    label="Promo Code (SAVE10)"
                    value={`-₹${formatIndianNumber(Math.round(total * 0.1))}`}
                    highlight
                    color="#4caf50"
                    icon={<LocalOfferIcon sx={{ fontSize: 16 }} />}
                  />
                )}

                <Divider sx={{ my: 1.5, borderColor: colors.border }} />

                <PriceRow
                  label="Total Amount"
                  value={`₹${formatIndianNumber(finalTotal)}`}
                  highlight
                  color={colors.primary}
                />
              </Box>

              {/* Promo Code */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: colors.primary, mb: 1, fontWeight: 600 }}>
                  Have a promo code?
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Enter code (try SAVE10)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    sx={{ flex: 1 }}
                    error={!!error && error.includes("promo code")}
                  />
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={handleApplyPromo}
                    sx={{ borderColor: colors.primary, color: colors.primary }}
                  >
                    Apply
                  </Button>
                </Box>
              </Box>

              {/* Additional Options */}
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={giftWrap} 
                      onChange={(e) => setGiftWrap(e.target.checked)}
                      sx={{ color: colors.primary }}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Add gift wrapping (+₹50)
                    </Typography>
                  }
                />
              </Box>

              {/* Trust Badges */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, 
                gap: 1.5, 
                mb: 2,
                p: 1.5,
                backgroundColor: `${colors.accent}30`,
                borderRadius: 2
              }}>
                <TrustBadge icon={<LocalShippingIcon />} label="Free Shipping" />
                <TrustBadge icon={<AssignmentReturnIcon />} label="Easy Returns" />
                <TrustBadge icon={<SecurityIcon />} label="Secure Payment" />
                <TrustBadge icon={<SupportAgentIcon />} label="24/7 Support" />
              </Box>
            </Box>

            {/* Right Side - Payment Options */}
            <Box sx={{ flex: 1, p: 3 }}>
              {/* Payment Security Info */}
              <Box sx={{ 
                p: 2, 
                backgroundColor: `${colors.primary}05`, 
                borderRadius: 2, 
                border: `1px solid ${colors.primary}20`,
                mb: 3
              }}>
                <Typography variant="subtitle2" sx={{ color: colors.primary, mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VerifiedUserIcon fontSize="small" />
                  100% Secure Payments
                </Typography>
                <Typography variant="caption" sx={{ color: colors.icon, display: 'block', mb: 1 }}>
                  • All major credit/debit cards accepted
                </Typography>
                <Typography variant="caption" sx={{ color: colors.icon, display: 'block', mb: 1 }}>
                  • UPI, Google Pay, PhonePe, Paytm supported
                </Typography>
                <Typography variant="caption" sx={{ color: colors.icon, display: 'block', mb: 1 }}>
                  • 256-bit SSL encryption
                </Typography>
                <Typography variant="caption" sx={{ color: colors.icon, display: 'block' }}>
                  • PCI DSS compliant payment gateway
                </Typography>
              </Box>

              {/* Delivery Information */}
              <Box sx={{ 
                p: 2, 
                backgroundColor: `${colors.primary}05`, 
                borderRadius: 2, 
                border: `1px solid ${colors.primary}20`,
                mb: 3
              }}>
                <Typography variant="subtitle2" sx={{ color: colors.primary, mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalShippingIcon fontSize="small" />
                  Delivery Information
                </Typography>
                <Typography variant="caption" sx={{ color: colors.icon, display: 'block', mb: 0.5 }}>
                  📦 Free delivery on orders above ₹499
                </Typography>
                <Typography variant="caption" sx={{ color: colors.icon, display: 'block', mb: 0.5 }}>
                  🚀 Express delivery in 1-2 business days
                </Typography>
                <Typography variant="caption" sx={{ color: colors.icon, display: 'block', mb: 0.5 }}>
                  📱 Real-time order tracking
                </Typography>
                <Typography variant="caption" sx={{ color: colors.icon, display: 'block' }}>
                  🔄 7-day hassle-free returns
                </Typography>
              </Box>

              {/* Additional Trust Elements */}
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <StarIcon sx={{ color: '#FFD700', fontSize: 16 }} />
                    <Typography variant="caption" sx={{ color: colors.icon }}>4.8/5 Rating</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ThumbUpIcon sx={{ color: colors.primary, fontSize: 16 }} />
                    <Typography variant="caption" sx={{ color: colors.icon }}>50k+ Happy Customers</Typography>
                  </Box>
                </Stack>
                <Typography variant="caption" sx={{ 
                  color: colors.icon, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: 1 
                }}>
                  <ShieldIcon fontSize="small" /> 
                  SSL Encrypted & Bank-level Security
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 2, backgroundColor: `${colors.background}`, borderTop: `1px solid ${colors.border}` }}>
          <Button 
            onClick={onClose}
            variant="outlined"
            sx={{
              borderColor: colors.primary,
              color: colors.primary,
              fontWeight: 600,
              borderRadius: 3,
              px: 4,
              py: 1,
              "&:hover": {
                background: colors.accent,
                borderColor: colors.primary,
              },
            }}
          >
            Continue Shopping
          </Button>
          <Button
            variant="contained"
            component={Link}
            to="/checkout"
            disabled={cartItems.length === 0}
            sx={{
              background: `linear-gradient(135deg, ${colors.primary} 0%, #d84315 100%)`,
              color: colors.badgeText,
              fontWeight: 700,
              borderRadius: 3,
              px: 6,
              py: 1,
              boxShadow: `0 4px 15px ${colors.primary}40`,
              "&:hover": {
                boxShadow: `0 6px 20px ${colors.primary}60`,
                transform: 'translateY(-1px)',
              },
              "&:disabled": {
                background: `${colors.icon}40`,
                color: `${colors.badgeText}80`,
              },
            }}
            onClick={onClose}
          >
            Complete Order - ₹{formatIndianNumber(finalTotal)}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 500 },
            boxSizing: 'border-box',
            bgcolor: colors.background,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight={700} sx={{ color: colors.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingCartIcon />
            Your Cart
            {cartItems.length > 0 && (
              <Chip 
                label={cartItems.length} 
                size="small" 
                sx={{ 
                  backgroundColor: colors.primary, 
                  color: colors.badgeText,
                  fontWeight: 'bold'
                }} 
              />
            )}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {cartItems.length > 0 && (
              <Tooltip title="Clear Cart" arrow>
                <IconButton 
                  onClick={handleClearCart}
                  sx={{ 
                    color: colors.error,
                    '&:hover': {
                      backgroundColor: `${colors.error}20`,
                    }
                  }}
                >
                  <ClearAllIcon />
                </IconButton>
              </Tooltip>
            )}
            <IconButton onClick={onClose} sx={{ color: colors.primary }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Scrollable product list */}
        <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
          {loading ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, justifyContent: "center", alignItems: "center", minHeight: 300 }}>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" width="90%" height={100} sx={{ borderRadius: 3 }} />
              ))}
              <CircularProgress sx={{ color: colors.primary }} />
            </Box>
          ) : cartItems.length === 0 ? (
            <Box sx={{ textAlign: "center", mt: 8 }}>
              <ShoppingCartIcon sx={{ fontSize: 80, color: colors.icon, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" sx={{ color: colors.primary, mb: 2 }}>
                Your cart is empty
              </Typography>
              <Typography variant="body2" sx={{ color: colors.icon, mb: 4 }}>
                Add some amazing products to get started!
              </Typography>
              <Button
                variant="contained"
                component={Link}
                to="/"
                onClick={onClose}
                sx={{
                  background: `linear-gradient(135deg, ${colors.primary} 0%, #d84315 100%)`,
                  color: colors.badgeText,
                  fontWeight: 600,
                  borderRadius: 3,
                  px: 4,
                  py: 1,
                }}
              >
                Start Shopping
              </Button>
            </Box>
          ) : (
            <AnimatePresence>
              {cartItems.map((item, index) => {
                const discountPercent = calculateDiscountPercentage(
                  item.marketPrice,
                  item.price
                );
                
                return (
                  <motion.div
                    key={item.productId + (item.size || "")}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ delay: index * 0.05, type: "spring" }}
                    layout
                  >
                    <Paper
                      elevation={2}
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        mb: 2,
                        p: 2,
                        borderRadius: 3,
                        gap: 2,
                        background: "#fff",
                        border: `1px solid ${colors.border}`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: `0 4px 12px ${colors.primary}15`,
                        },
                      }}
                    >
                      {/* Product Image */}
                      <Box
                        component={Link}
                        to={`/product/${item.productId}`}
                        onClick={onClose}
                        sx={{
                          width: 80,
                          height: 100,
                          borderRadius: 2,
                          overflow: "hidden",
                          flexShrink: 0,
                          boxShadow: `0 4px 8px ${colors.primary}20`,
                        }}
                      >
                        <Box
                          component="img"
                          src={item.image}
                          alt={item.name}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.3s ease",
                            "&:hover": { transform: "scale(1.05)" },
                          }}
                        />
                      </Box>

                      {/* Product Details */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          component={Link}
                          to={`/product/${item.productId}`}
                          onClick={onClose}
                          fontWeight={700}
                          sx={{
                            color: colors.primary,
                            fontSize: "1rem",
                            mb: 1,
                            display: "block",
                            textDecoration: "none",
                            "&:hover": {
                              textDecoration: "underline",
                              color: "#d84315",
                            },
                          }}
                        >
                          {item.name}
                        </Typography>
                        
                        {/* Product Badges */}
                        <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: 'wrap' }}>
                          <Chip 
                            label={`Size: ${item.size || "N/A"}`}
                            size="small" 
                            sx={{ 
                              background: colors.accent, 
                              color: colors.primary, 
                              fontWeight: 'bold',
                              fontSize: '0.7rem',
                              height: 22,
                              mb: 0.5,
                              borderRadius: 1
                            }} 
                          />
                          <Chip 
                            label={`Color: ${item.color || "N/A"}`}
                            size="small" 
                            sx={{ 
                              background: colors.accent, 
                              color: colors.primary, 
                              fontWeight: 'bold',
                              fontSize: '0.7rem',
                              height: 22,
                              mb: 0.5,
                              borderRadius: 1
                            }} 
                          />
                          {discountPercent > 0 && (
                            <Chip 
                              icon={<DiscountIcon sx={{ fontSize: '12px !important' }} />} 
                              label={`${discountPercent}% OFF`} 
                              size="small" 
                              sx={{ 
                                background: colors.primary, 
                                color: 'white', 
                                fontWeight: 'bold',
                                fontSize: '0.7rem',
                                height: 22,
                                mb: 0.5,
                                borderRadius: 1,
                                '& .MuiChip-icon': {
                                  color: 'white !important'
                                }
                              }} 
                            />
                          )}
                        </Stack>
                        
                        {/* Price Display */}
                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', mb: 1.5 }}>
                          {item.marketPrice > item.price ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                              <Typography sx={{ 
                                textDecoration: 'line-through', 
                                color: colors.icon, 
                                fontSize: '0.9rem',
                                mr: 1
                              }}>
                                ₹{formatIndianNumber(item.marketPrice)}
                              </Typography>
                              <Typography sx={{ 
                                color: colors.primary, 
                                fontWeight: 'bold', 
                                fontSize: '1rem' 
                              }}>
                                ₹{formatIndianNumber(item.price || 0)}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography sx={{ 
                              color: colors.primary, 
                              fontWeight: 'bold', 
                              fontSize: '1rem',
                              mr: 1
                            }}>
                              ₹{formatIndianNumber(item.price || 0)}
                            </Typography>
                          )}
                          
                          {discountPercent > 0 && (
                            <Chip 
                              label={`Save ₹${formatIndianNumber((item.marketPrice - item.price) * (item.qty || 1))}`}
                              size="small" 
                              sx={{ 
                                background: "#4caf5015", 
                                color: "#4caf50",
                                border: "1px solid #4caf5030",
                                fontWeight: 'bold',
                                fontSize: '0.7rem',
                                borderRadius: 1
                              }} 
                            />
                          )}
                        </Box>
                        
                        {/* Quantity Selector */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Paper elevation={0} sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            border: `1px solid ${colors.border}`, 
                            borderRadius: 2,
                          }}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleQuantityChange(item.productId, item.size, (item.qty || 1) - 1)}
                              disabled={item.qty <= 1}
                              sx={{ color: colors.primary }}
                            >
                              <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography sx={{ px: 1.5, minWidth: 30, textAlign: 'center', fontWeight: 'bold' }}>
                              {item.qty || 1}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => handleQuantityChange(item.productId, item.size, (item.qty || 1) + 1)}
                              sx={{ color: colors.primary }}
                            >
                              <AddIcon fontSize="small" />
                            </IconButton>
                          </Paper>
                          
                          <Typography sx={{ color: colors.primary, fontWeight: 'bold' }}>
                            ₹{formatIndianNumber((item.price || 0) * (item.qty || 1))}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Delete Button */}
                      <IconButton
                        onClick={() => handleRemoveFromCart(item.productId, item.size)}
                        sx={{
                          color: colors.error,
                          "&:hover": {
                            backgroundColor: colors.error + "20",
                            color: colors.error,
                          },
                          transition: "all 0.2s ease",
                        }}
                      >
                        <DeleteIcon sx={{ color: colors.error }} />
                      </IconButton>
                    </Paper>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </Box>

        {/* Sticky buttons at bottom */}
        {cartItems.length > 0 && (
          <Box sx={{ 
            position: 'sticky', 
            bottom: 0, 
            backgroundColor: colors.background, 
            pt: 2, 
            borderTop: `1px solid ${colors.border}`,
            zIndex: 10 
          }}>
<Button
  fullWidth
  variant="contained"
  onClick={() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      setError("Please log in to proceed to checkout");
      window.location.href = "/login";
      return;
    }
    // Pass flag to indicate from cart sidebar
    navigate("/checkout", { state: { fromCartSidebar: true } });
    onClose(); // Close sidebar
  }}
  sx={{
    background: `linear-gradient(135deg, ${colors.primary} 0%, #d84315 100%)`,
    color: colors.badgeText,
    fontWeight: 700,
    borderRadius: 3,
    py: 1.5,
    mb: 1,
    boxShadow: `0 4px 15px ${colors.primary}40`,
    "&:hover": {
      boxShadow: `0 6px 20px ${colors.primary}60`,
      transform: 'translateY(-1px)',
    },
  }}
>
  Checkout Now - ₹{formatIndianNumber(finalTotal)}
</Button>

            <Button
              fullWidth
              variant="outlined"
              component={Link}
              to="/"
              onClick={onClose}
              sx={{
                borderColor: colors.primary,
                color: colors.primary,
                fontWeight: 600,
                borderRadius: 3,
                py: 1.5,
                "&:hover": {
                  background: colors.accent,
                  borderColor: colors.primary,
                },
              }}
            >
              Continue Shopping
            </Button>
          </Box>
        )}
      </Drawer>

      <CheckoutPopup 
        open={checkoutOpen} 
        onClose={() => setCheckoutOpen(false)} 
      />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CartSidebar;