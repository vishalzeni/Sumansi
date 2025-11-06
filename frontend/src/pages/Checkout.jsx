import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Divider,
  Stack,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Snackbar,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  Chip,
  useTheme,
  useMediaQuery,
  Zoom,
} from "@mui/material";
import { useCart } from "../hooks/useCart";
import { useNavigate, useLocation } from "react-router-dom";
import colors from "../colors";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentIcon from "@mui/icons-material/Payment";
import HomeIcon from "@mui/icons-material/Home";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BusinessIcon from "@mui/icons-material/Business";
import FlagIcon from "@mui/icons-material/Flag";
import SecurityIcon from "@mui/icons-material/Security";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import DiscountIcon from "@mui/icons-material/Discount";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { API_BASE_URL } from "../config";

// --- Styles ---
const paperStyles = {
  p: 3,
  borderRadius: 3,
  background: `linear-gradient(135deg, ${colors.cardBg} 0%, #ffffff 100%)`,
  border: `1px solid ${colors.border}30`,
  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
};

const typographyStyles = {
  mb: 3,
  color: colors.primary,
  display: "flex",
  alignItems: "center",
  gap: 1,
  fontSize: "1.1rem",
};

// --- Presentational Components ---
const OrderSummary = React.memo(function OrderSummary({
  items,
  showSuccess,
  totalSavings,
  formatIndianNumber,
  colors,
  fromBuyNow,
}) {
  return (
    <Zoom in={showSuccess} timeout={600}>
      <Paper sx={paperStyles}>
        <Typography variant="h6" fontWeight={700} sx={typographyStyles}>
          <ShoppingCartIcon />
          {fromBuyNow ? "Order Summary (1 item)" : `Order Summary (${items.length} items)`}
        </Typography>
        <Box sx={{ maxHeight: "200px", overflowY: "auto", mb: 2 }}>
          {items.map((item, index) => (
            <Box
              key={`${item.productId}-${item.size || ""}-${index}`}
              sx={{
                display: "flex",
                gap: 2,
                mb: 2,
                pb: 2,
                borderBottom: `1px solid ${colors.border}20`,
              }}
            >
              <Box
                component="img"
                src={item.image || "/placeholder.jpg"}
                alt={item.name || "Product"}
                sx={{
                  width: 60,
                  height: 60,
                  objectFit: "cover",
                  borderRadius: 2,
                  border: `1px solid ${colors.border}20`,
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                  {item.name}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
                  {item.size && (
                    <Chip label={`Size: ${item.size}`} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.7rem" }} />
                  )}
                  {item.color && (
                    <Chip label={`Color: ${item.color}`} size="small" variant="outlined" sx={{ height: 20, fontSize: "0.7rem" }} />
                  )}
                </Box>
                <Typography variant="body2" sx={{ mt: 0.5, color: colors.icon, textAlign: "left" }}>
                  Qty: {item.qty} × ₹{formatIndianNumber(item.price)}
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight={700} color={colors.primary}>
                ₹{formatIndianNumber(item.price * item.qty)}
              </Typography>
            </Box>
          ))}
        </Box>
        {totalSavings > 0 && (
          <Box
            sx={{
              p: 2,
              backgroundColor: `${colors.success}15`,
              borderRadius: 2,
              border: `1px solid ${colors.success}30`,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <DiscountIcon sx={{ color: colors.success, fontSize: 20 }} />
            <Typography variant="body2" color={colors.success} fontWeight={600}>
              You saved ₹{formatIndianNumber(totalSavings)} on this order!
            </Typography>
          </Box>
        )}
      </Paper>
    </Zoom>
  );
});

const PersonalInfoForm = React.memo(function PersonalInfoForm({ formData, formErrors, onChange, colors }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: colors.primary, display: "flex", alignItems: "center", gap: 1 }}>
        <PersonIcon fontSize="small" />
        Personal Information
      </Typography>
      <Stack spacing={2}>
        <TextField fullWidth size="small" label="Full Name" name="fullName" value={formData.fullName} onChange={onChange} required error={!!formErrors.fullName} helperText={formErrors.fullName}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background } }}
          InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: colors.primary, fontSize: 20 }} /></InputAdornment> }}
        />
        <TextField fullWidth size="small" label="Email" name="email" type="email" value={formData.email} onChange={onChange} required error={!!formErrors.email} helperText={formErrors.email}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background } }}
          InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: colors.primary, fontSize: 20 }} /></InputAdornment> }}
        />
        <TextField fullWidth size="small" label="Phone" name="phone" value={formData.phone} onChange={onChange} required error={!!formErrors.phone} helperText={formErrors.phone}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background } }}
          InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: colors.primary, fontSize: 20 }} /></InputAdornment> }}
        />
      </Stack>
    </Box>
  );
});

const AddressForm = React.memo(function AddressForm({ formData, formErrors, onChange, colors }) {
  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: colors.primary, display: "flex", alignItems: "center", gap: 1 }}>
        <HomeIcon fontSize="small" />
        Delivery Address
      </Typography>
      <Stack spacing={2}>
        <TextField fullWidth size="small" label="Complete Address" name="address" value={formData.address} onChange={onChange} required multiline rows={2} error={!!formErrors.address} helperText={formErrors.address}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background } }}
          InputProps={{ startAdornment: <InputAdornment position="start"><HomeIcon sx={{ color: colors.primary, fontSize: 20, alignSelf: "flex-start", mt: 1 }} /></InputAdornment> }}
        />
        <TextField fullWidth size="small" label="Landmark (Optional)" name="landmark" value={formData.landmark} onChange={onChange}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background } }}
          InputProps={{ startAdornment: <InputAdornment position="start"><FlagIcon sx={{ color: colors.primary, fontSize: 20 }} /></InputAdornment> }}
        />
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField fullWidth size="small" label="Pincode" name="pincode" value={formData.pincode} onChange={onChange} required error={!!formErrors.pincode} helperText={formErrors.pincode}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon sx={{ color: colors.primary, fontSize: 20 }} /></InputAdornment> }}
          />
          <TextField fullWidth size="small" label="City" name="city" value={formData.city} onChange={onChange} required error={!!formErrors.city} helperText={formErrors.city}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><BusinessIcon sx={{ color: colors.primary, fontSize: 20 }} /></InputAdornment> }}
          />
        </Box>
        <TextField fullWidth size="small" label="State" name="state" value={formData.state} onChange={onChange} required error={!!formErrors.state} helperText={formErrors.state}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background } }}
          InputProps={{ startAdornment: <InputAdornment position="start"><BusinessIcon sx={{ color: colors.primary, fontSize: 20 }} /></InputAdornment> }}
        />
      </Stack>
    </Box>
  );
});

const ShippingDetailsForm = React.memo(function ShippingDetailsForm({ formData, formErrors, onChange, colors, shippingCost, paymentMethod, formatIndianNumber }) {
  return (
    <Paper sx={paperStyles}>
      <Typography variant="h6" fontWeight={700} sx={typographyStyles}>
        <LocalShippingIcon />
        Shipping Details
      </Typography>
      <PersonalInfoForm formData={formData} formErrors={formErrors} onChange={onChange} colors={colors} />
      <AddressForm formData={formData} formErrors={formErrors} onChange={onChange} colors={colors} />
      <Box sx={{ mt: 3, p: 2, backgroundColor: `${colors.primary}08`, borderRadius: 2, border: `1px solid ${colors.primary}20` }}>
        <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1, color: colors.primary, fontWeight: 600 }}>
          <LocalShippingIcon fontSize="small" />
          {paymentMethod === "cod" ? `COD delivery charge ₹${formatIndianNumber(shippingCost)} will be added to your bill` : "Free shipping for pre-paid (online) orders"}
        </Typography>
      </Box>
    </Paper>
  );
});

const PaymentMethodForm = React.memo(function PaymentMethodForm({ paymentMethod, setPaymentMethod, colors, showSuccess }) {
  return (
    <Zoom in={showSuccess} timeout={600} style={{ transitionDelay: "400ms" }}>
      <Paper sx={paperStyles}>
        <Typography variant="h6" fontWeight={700} sx={typographyStyles}>
          <PaymentIcon />
          Payment Method
        </Typography>
        <FormControl fullWidth>
          <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <FormControlLabel value="online" control={<Radio size="small" sx={{ color: colors.primary }} />} label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ p: 1, borderRadius: 2, backgroundColor: `${colors.primary}10`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PaymentIcon sx={{ color: colors.primary, fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="body1" fontWeight={600}>Pay Online</Typography>
                  <Typography variant="caption" color="text.secondary">Credit/Debit Card, UPI, Net Banking via Razorpay</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                    <SecurityIcon sx={{ fontSize: 12, color: colors.success }} />
                    <Typography variant="caption" color={colors.success}>Secure & Encrypted</Typography>
                  </Box>
                </Box>
              </Box>
            } sx={{
              mb: 2, p: 2, border: `2px solid ${paymentMethod === "online" ? colors.primary : colors.border}30`, borderRadius: 2,
              backgroundColor: paymentMethod === "online" ? `${colors.primary}08` : "transparent", transition: "all 0.3s ease",
              "&:hover": { borderColor: colors.primary, backgroundColor: `${colors.primary}05` }
            }} />
            <FormControlLabel value="cod" control={<Radio size="small" sx={{ color: colors.primary }} />} label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ p: 1, borderRadius: 2, backgroundColor: `${colors.warning}10`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <PriceCheckIcon sx={{ color: colors.warning, fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="body1" fontWeight={600}>Cash on Delivery</Typography>
                  <Typography variant="caption" color="text.secondary">Pay when your order is delivered</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                    <CheckCircleIcon sx={{ fontSize: 12, color: colors.success }} />
                    <Typography variant="caption" color={colors.success}>No advance payment required</Typography>
                  </Box>
                </Box>
              </Box>
            } sx={{
              p: 2, border: `2px solid ${paymentMethod === "cod" ? colors.primary : colors.border}30`, borderRadius: 2,
              backgroundColor: paymentMethod === "cod" ? `${colors.primary}08` : "transparent", transition: "all 0.3s ease",
              "&:hover": { borderColor: colors.primary, backgroundColor: `${colors.primary}05` }
            }} />
          </RadioGroup>
        </FormControl>
        {paymentMethod === "online" && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: `${colors.info}08`, borderRadius: 2, border: `1px solid ${colors.info}20` }}>
            <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 1, color: colors.info }}>
              <SecurityIcon fontSize="small" />
              Your payment is secured with Razorpay. We don't store your card details.
            </Typography>
          </Box>
        )}
      </Paper>
    </Zoom>
  );
});

const PromoCodeSection = React.memo(function PromoCodeSection({
  promoCode, setPromoCode, applyPromoCode, promoError, promoApplied, promoLoading, colors, showSuccess, isFirstOrder
}) {
  if (!isFirstOrder) return null;

  return (
    <Zoom in={showSuccess} timeout={600} style={{ transitionDelay: "200ms" }}>
      <Paper sx={paperStyles}>
        <Typography variant="h6" fontWeight={700} sx={typographyStyles}>
          <LocalOfferIcon />
          Promo Code
        </Typography>
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <TextField
            fullWidth size="small" label="Enter promo code (optional)" placeholder="FIRSTSUMANSI"
            value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} disabled={promoApplied}
            error={!!promoError} helperText={promoError}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: colors.background } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><LocalOfferIcon sx={{ color: colors.primary, fontSize: 20 }} /></InputAdornment> }}
          />
          <Button
            variant={promoApplied ? "contained" : "outlined"} onClick={applyPromoCode} disabled={promoLoading || promoApplied}
            sx={{
              minWidth: 100, borderRadius: 2, fontWeight: 600,
              background: promoApplied ? colors.success : "transparent", borderColor: promoApplied ? colors.success : colors.primary,
              color: promoApplied ? "white" : colors.primary,
              "&:hover": { background: promoApplied ? colors.success : `${colors.primary}08`, borderColor: colors.primary }
            }}
          >
            {promoLoading ? <CircularProgress size={20} /> : promoApplied ? "Applied" : "Apply"}
          </Button>
        </Box>
        {promoApplied && (
          <Box sx={{ p: 2, backgroundColor: `${colors.success}15`, borderRadius: 2, border: `1px solid ${colors.success}30` }}>
            <Typography variant="body2" color={colors.success} fontWeight={600}>
              10% discount applied! Welcome to Sumansi - enjoy your first order discount!
            </Typography>
          </Box>
        )}
      </Paper>
    </Zoom>
  );
});

const PaymentSummary = React.memo(function PaymentSummary({
  activeStep, fromCartSidebar, subtotal, totalSavings, shippingCost, finalTotal, colors, loading, handleProceed, handleBackStep,
  paymentMethod, formatIndianNumber, showSuccess, promoDiscount, promoApplied, isFirstOrder, isPromoResolved
}) {
  const discountedSubtotal = subtotal - promoDiscount;
  const displayTotal = discountedSubtotal + shippingCost;

  return (
    <Zoom in={showSuccess} timeout={600} style={{ transitionDelay: "600ms" }}>
      <Paper sx={{ ...paperStyles, position: "sticky", top: 100 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 3, color: colors.primary, fontSize: "1.1rem" }}>Payment Summary</Typography>
        <Stack spacing={1.5} sx={{ mb: 3 }}>
          {!fromCartSidebar && (
            <>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color={colors.icon}>Subtotal</Typography>
                <Typography variant="body2" fontWeight={600}>₹{formatIndianNumber(subtotal)}</Typography>
              </Box>
              {totalSavings > 0 && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color={colors.success}>Total Savings</Typography>
                  <Typography variant="body2" fontWeight={600} color={colors.success}>-₹{formatIndianNumber(totalSavings)}</Typography>
                </Box>
              )}
              {promoDiscount > 0 && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color={colors.success}>First Order Discount</Typography>
                  <Typography variant="body2" fontWeight={600} color={colors.success}>-₹{formatIndianNumber(promoDiscount)}</Typography>
                </Box>
              )}
              {(promoDiscount > 0 || isFirstOrder) && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color={colors.icon}>Discounted Subtotal</Typography>
                  <Typography variant="body2" fontWeight={600}>₹{formatIndianNumber(discountedSubtotal)}</Typography>
                </Box>
              )}
            </>
          )}
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color={colors.icon}>Shipping</Typography>
            <Typography variant="body2" fontWeight={600} color={shippingCost === 0 ? colors.success : "inherit"}>
              {shippingCost === 0 ? "FREE" : `₹${formatIndianNumber(shippingCost)}`}
            </Typography>
          </Box>
          <Divider sx={{ my: 1, borderColor: colors.border }} />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="subtitle1" fontWeight={700} color={colors.primary}>Total Amount</Typography>
            <Typography variant="subtitle1" fontWeight={700} color={colors.primary}>₹{formatIndianNumber(displayTotal)}</Typography>
          </Box>
          {isFirstOrder && !promoApplied && (
            <Box sx={{ mt: 1, p: 1.5, backgroundColor: `${colors.info}08`, borderRadius: 2, border: `1px solid ${colors.info}20` }}>
              <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 1, color: colors.info, fontWeight: 600 }}>
                <LocalOfferIcon fontSize="small" />
                10% welcome discount will be auto-applied at checkout!
              </Typography>
            </Box>
          )}
          {isFirstOrder && !isPromoResolved && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: "center" }}>
              Applying welcome discount...
            </Typography>
          )}
        </Stack>
        <Stack spacing={1.5}>
          {activeStep > 0 && (
            <Button fullWidth variant="outlined" size="small" onClick={handleBackStep} disabled={loading}
              sx={{ py: 1.5, borderColor: colors.border, color: colors.primary, fontWeight: 600, borderRadius: 2,
                "&:hover": { borderColor: colors.primary, backgroundColor: `${colors.primary}08` }, "&:disabled": { opacity: 0.5 }
              }}
            >
              Go Back
            </Button>
          )}
          <Button
            fullWidth variant="contained" disableElevation size="small" onClick={handleProceed}
            disabled={loading || (isFirstOrder && !isPromoResolved)}
            sx={{
              py: 1.5, color: "white", background: colors.primary, fontWeight: 700, fontSize: "0.9rem", borderRadius: 2,
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
              "&:hover": { background: `linear-gradient(135deg, ${colors.primary}dd 0%, ${colors.secondary}dd 100%)`, boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3)", transform: "translateY(-1px)" },
              "&:disabled": { background: colors.border, color: "#fff", opacity: 0.6 }
            }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: "white" }} /> : (activeStep === 2 && !fromCartSidebar) || (activeStep === 1 && fromCartSidebar) ? (
              paymentMethod === "online" ? "Pay Now" : "Place Order"
            ) : "Continue"}
          </Button>
        </Stack>
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <SecurityIcon sx={{ fontSize: 16, color: colors.success }} />
            <Typography variant="caption" color={colors.icon}>Secure</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <LocalShippingIcon sx={{ fontSize: 16, color: colors.success }} />
            <Typography variant="caption" color={colors.icon}>Fast Delivery</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <CheckCircleIcon sx={{ fontSize: 16, color: colors.success }} />
            <Typography variant="caption" color={colors.icon}>Easy Returns</Typography>
          </Box>
        </Box>
      </Paper>
    </Zoom>
  );
});

const Checkout = () => {
  const { cartItems = [], clearCart } = useCart() || {};
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const fromCartSidebar = location.state?.fromCartSidebar || false;
  const fromBuyNow = location.state?.fromBuyNow || false;
  const buyNowData = fromBuyNow ? location.state : null;

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Promo states
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoLoading, setPromoLoading] = useState(false);
  const [isFirstOrder, setIsFirstOrder] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [isPromoResolved, setIsPromoResolved] = useState(false);

  const [formData, setFormData] = useState(() => {
    try {
      const savedData = JSON.parse(localStorage.getItem("checkoutFormData")) || {};
      return {
        fullName: savedData.fullName || "",
        email: savedData.email || "",
        phone: savedData.phone || "",
        address: savedData.address || "",
        city: savedData.city || "",
        state: savedData.state || "",
        pincode: savedData.pincode || "",
        landmark: savedData.landmark || "",
      };
    } catch {
      return {
        fullName: "", email: "", phone: "", address: "", city: "", state: "", pincode: "", landmark: ""
      };
    }
  });

  const [paymentMethod, setPaymentMethod] = useState("online");

  const steps = fromCartSidebar
    ? [{ label: "Shipping", icon: <LocalShippingIcon /> }, { label: "Payment", icon: <PaymentIcon /> }]
    : [{ label: "Order Summary", icon: <ShoppingCartIcon /> }, { label: "Shipping", icon: <LocalShippingIcon /> }, { label: "Payment", icon: <PaymentIcon /> }];

  // Initialize
  useEffect(() => {
    window.scrollTo(0, 0);
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) { navigate("/login"); return; }
      const user = JSON.parse(userStr);
      if (!user) { navigate("/login"); return; }

      setFormData(prev => ({ ...prev, fullName: prev.fullName || user.name || "", email: prev.email || user.email || "" }));
      checkFirstOrderStatus(user.accessToken);
      setIsInitialized(true);
    } catch { navigate("/login"); }
  }, [navigate]);

  const checkFirstOrderStatus = async (accessToken) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payment/first-order-status`, {
        method: "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        setIsFirstOrder(data.isFirstOrder);
        if (data.isFirstOrder) {
          const discount = Math.round(subtotal * 0.1 * 100) / 100;
          setPromoDiscount(discount);
          setPromoApplied(true);
          setPromoCode("FIRSTSUMANSI");
        }
      }
    } catch (error) {
      console.error("Failed to check first order status:", error);
    } finally {
      setIsPromoResolved(true);
    }
  };

  const applyPromoCode = async () => {
    if (!isFirstOrder) { setPromoError("Promo code is only available for first orders"); return; }
    if (!promoCode.trim()) { setPromoError("Please enter a promo code"); return; }

    setPromoLoading(true); setPromoError("");
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) { navigate("/login"); return; }
      const user = JSON.parse(userStr);
      const accessToken = user?.accessToken;
      if (!accessToken) { navigate("/login"); return; }

      const response = await fetch(`${API_BASE_URL}/payment/validate-promo`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ promoCode: promoCode.trim(), subtotal }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.valid) {
          setPromoDiscount(data.discountAmount);
          setPromoApplied(true);
          setPromoError("");
        } else {
          setPromoError(data.message || "Invalid promo code");
          setPromoApplied(false);
          setPromoDiscount(0);
        }
      } else {
        const errorData = await response.json();
        setPromoError(errorData.message || "Failed to validate promo code");
        setPromoApplied(false);
        setPromoDiscount(0);
      }
    } catch (error) {
      setPromoError("Network error. Please try again.");
      setPromoApplied(false);
      setPromoDiscount(0);
    } finally {
      setPromoLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialized) {
      try { localStorage.setItem("checkoutFormData", JSON.stringify(formData)); }
      catch (error) { console.error("Failed to save form data:", error); }
    }
  }, [formData, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      if (!fromBuyNow && cartItems.length === 0) { navigate("/"); return; }
      setShowSuccess(true);
    }
  }, [cartItems.length, navigate, fromBuyNow, isInitialized]);

  useEffect(() => {
    return () => {
      const scripts = document.querySelectorAll('script[src*="razorpay"]');
      scripts.forEach(script => script.remove());
    };
  }, []);

  const formatIndianNumber = useCallback((num) => {
    if (!num && num !== 0) return "0";
    const number = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(number)) return "0";
    return number.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
  }, []);

  const getRazorpayAmount = useCallback((amount) => {
    const amountInRupees = typeof amount === 'string' ? parseFloat(amount) : amount;
    console.log('Converting to paise:', { originalAmount: amountInRupees, amountInPaise: Math.round(amountInRupees * 100) });
    return Math.round(amountInRupees);
  }, []);

  const getItemsForSummary = useMemo(() => {
    if (fromBuyNow && buyNowData) {
      return [{
        name: buyNowData.product?.name || "Product",
        price: buyNowData.product?.price || 0,
        marketPrice: buyNowData.product?.marketPrice || buyNowData.product?.price || 0,
        image: buyNowData.product?.image || "/placeholder.jpg",
        productId: buyNowData.product?.id || buyNowData.product?._id || `buynow-${Date.now()}`,
        qty: buyNowData.quantity || 1,
        size: buyNowData.size,
        color: buyNowData.color,
      }];
    }
    return cartItems.map(item => ({
      ...item,
      name: item.name || "Product",
      price: item.price || 0,
      marketPrice: item.marketPrice || item.price || 0,
      image: item.image || "/placeholder.jpg",
      productId: item.productId || item.id || item._id || `item-${Date.now()}`,
      qty: item.qty || 1,
      size: item.size,
      color: item.color,
    }));
  }, [cartItems, fromBuyNow, buyNowData]);

  const items = getItemsForSummary;

  const subtotal = useMemo(() => {
    const total = items.reduce((sum, item) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      const qty = typeof item.qty === 'string' ? parseInt(item.qty) : item.qty;
      return sum + (price || 0) * (qty || 1);
    }, 0);
    return Math.round(total * 100) / 100;
  }, [items]);

  const marketTotal = useMemo(() => {
    const total = items.reduce((sum, item) => {
      const marketPrice = typeof item.marketPrice === 'string' ? parseFloat(item.marketPrice) : item.marketPrice;
      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
      const actualMarketPrice = marketPrice || price || 0;
      const qty = typeof item.qty === 'string' ? parseInt(item.qty) : item.qty;
      return sum + actualMarketPrice * (qty || 1);
    }, 0);
    return Math.round(total * 100) / 100;
  }, [items]);

  const totalSavings = useMemo(() => Math.max(0, Math.round((marketTotal - subtotal) * 100) / 100), [marketTotal, subtotal]);

  const shippingCost = useMemo(() => (paymentMethod === "cod" ? 80 : 0), [paymentMethod]);

  const finalTotal = useMemo(() => {
    const total = subtotal - promoDiscount + shippingCost;
    console.log('Final Total Calculation:', { subtotal, promoDiscount, shippingCost, finalTotal: total });
    return Math.round(total * 100) / 100;
  }, [subtotal, promoDiscount, shippingCost]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "phone") newValue = value.replace(/[^0-9]/g, "").slice(0, 10);
    else if (name === "pincode") newValue = value.replace(/[^0-9]/g, "").slice(0, 6);
    setFormData(prev => ({ ...prev, [name]: newValue }));
    setFormErrors(prev => {
      if (!prev[name]) return prev;
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  const validateForm = useCallback(() => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Valid email is required";
    if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone)) errors.phone = "10-digit phone number required";
    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.state.trim()) errors.state = "State is required";
    if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode)) errors.pincode = "6-digit pincode required";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Please fill all required fields correctly");
      setSnackbarOpen(true);
      return false;
    }
    return true;
  }, [formData]);

  const loadRazorpayScript = useCallback(() => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const handleApiError = useCallback((response) => {
    if (response.status === 401) {
      localStorage.removeItem("user");
      localStorage.removeItem("checkoutFormData");
      navigate("/login");
      return true;
    }
    return false;
  }, [navigate]);

  const handlePayment = useCallback(async () => {
    if (!validateForm()) return;
    setLoading(true); setError("");

    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) throw new Error("Failed to load payment gateway");

      const userStr = localStorage.getItem("user");
      if (!userStr) { navigate("/login"); return; }
      const user = JSON.parse(userStr);
      const accessToken = user?.accessToken;
      if (!accessToken) { navigate("/login"); return; }

      const amountToPay = finalTotal;
      const amountInPaise = getRazorpayAmount(amountToPay);

      console.log('PAYMENT INITIATED WITH:', { finalTotal, amountInPaise, promoDiscount, isPromoResolved });

      if (amountInPaise < 100) throw new Error("Amount must be at least ₹1");

      const orderResponse = await fetch(`${API_BASE_URL}/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ amount: amountInPaise, currency: "INR", receipt: `order_${Date.now()}` }),
      });

      if (handleApiError(orderResponse)) return;
      if (!orderResponse.ok) throw new Error("Failed to create order");

      const orderData = await orderResponse.json();
      const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY_ID;
      if (!razorpayKey) throw new Error("Razorpay key not configured");

      console.log('RAZORPAY ORDER CREATED:', { orderId: orderData.id, amount: orderData.amount, expectedAmount: amountInPaise });

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Sumansi",
        description: "Purchase from Sumansi",
        order_id: orderData.id,
        image: "/SUMAN.png",
        handler: async function (response) {
          try {
            const verifyResponse = await fetch(`${API_BASE_URL}/payment/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderDetails: {
                  items: items.map(item => ({
                    productId: item.productId, qty: item.qty, size: item.size, color: item.color,
                    price: item.price, name: item.name, image: item.image
                  })),
                  shippingAddress: formData,
                  totalAmount: amountToPay,
                  promoCode: promoApplied ? promoCode : null,
                  promoDiscount: promoDiscount,
                  isFirstOrder: isFirstOrder,
                },
              }),
            });

            if (handleApiError(verifyResponse)) return;
            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok) {
              const orderDetails = {
                orderId: verifyData.orderId,
                paymentId: response.razorpay_payment_id,
                items: items.map(item => ({
                  productId: item.productId, qty: item.qty, size: item.size, color: item.color,
                  price: item.price, name: item.name, image: item.image
                })),
                shippingAddress: formData,
                totalAmount: amountToPay,
                paymentMethod: "Online",
                promoCode: promoApplied ? promoCode : null,
                promoDiscount: promoDiscount,
                isFirstOrder: isFirstOrder,
                createdAt: new Date().toISOString(),
              };

              navigate("/order-success", { state: orderDetails, replace: true });
              setTimeout(() => {
                try {
                  localStorage.setItem("lastOrder", JSON.stringify(orderDetails));
                  if (clearCart) clearCart();
                  localStorage.removeItem("checkoutFormData");
                } catch (error) { console.error("Cleanup error:", error); }
              }, 100);
            } else {
              throw new Error(verifyData.message || "Payment verification failed");
            }
          } catch (error) {
            setError(error.message || "Payment verification failed");
            setSnackbarOpen(true);
            setLoading(false);
          }
        },
        prefill: { name: formData.fullName, email: formData.email, contact: formData.phone },
        notes: { address: formData.address },
        theme: { color: colors.primary },
        modal: { ondismiss: () => { setLoading(false); setError("Payment cancelled"); setSnackbarOpen(true); } },
      };

      if (window.Razorpay) {
        const razorpay = new window.Razorpay(options);
        razorpay.on("payment.failed", function (response) {
          console.error('RAZORPAY PAYMENT FAILED:', response);
          setError(response.error.description || "Payment failed");
          setSnackbarOpen(true);
          setLoading(false);
        });
        razorpay.open();
      } else {
        throw new Error("Payment gateway failed to initialize");
      }
    } catch (error) {
      setError(error.message || "Something went wrong");
      setSnackbarOpen(true);
      setLoading(false);
    }
  }, [
    validateForm, loadRazorpayScript, finalTotal, items, formData, handleApiError, navigate, clearCart, colors.primary,
    promoApplied, promoCode, promoDiscount, isFirstOrder, getRazorpayAmount, formatIndianNumber, subtotal, shippingCost, isPromoResolved
  ]);

  const handleCOD = useCallback(async () => {
    if (!validateForm()) return;
    setLoading(true); setError("");

    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) { navigate("/login"); return; }
      const user = JSON.parse(userStr);
      const accessToken = user?.accessToken;
      if (!accessToken) { navigate("/login"); return; }

      const response = await fetch(`${API_BASE_URL}/payment/create-cod-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId, qty: item.qty, size: item.size, color: item.color,
            price: item.price, name: item.name, image: item.image
          })),
          shippingAddress: formData,
          totalAmount: finalTotal,
          paymentMethod: "COD",
          promoCode: promoApplied ? promoCode : null,
          promoDiscount: promoDiscount,
          isFirstOrder: isFirstOrder,
        }),
      });

      if (handleApiError(response)) return;
      const data = await response.json();

      if (response.ok) {
        const orderDetails = {
          orderId: data.orderId, isCOD: true,
          items: items.map(item => ({
            productId: item.productId, qty: item.qty, size: item.size, color: item.color,
            price: item.price, name: item.name, image: item.image
          })),
          shippingAddress: formData,
          totalAmount: finalTotal,
          paymentMethod: "COD",
          promoCode: promoApplied ? promoCode : null,
          promoDiscount: promoDiscount,
          isFirstOrder: isFirstOrder,
          createdAt: new Date().toISOString(),
        };

        navigate("/order-success", { state: orderDetails, replace: true });
        setTimeout(() => {
          try {
            localStorage.setItem("lastOrder", JSON.stringify(orderDetails));
            if (clearCart) clearCart();
            localStorage.removeItem("checkoutFormData");
          } catch (error) { console.error("Cleanup error:", error); }
        }, 100);
      } else {
        throw new Error(data.message || "Failed to place order");
      }
    } catch (error) {
      setError(error.message || "Something went wrong");
      setSnackbarOpen(true);
      setLoading(false);
    }
  }, [validateForm, items, formData, finalTotal, handleApiError, navigate, clearCart, promoApplied, promoCode, promoDiscount, isFirstOrder]);

  const handleProceed = useCallback(() => {
    if (activeStep === 0 && !fromCartSidebar) {
      setActiveStep(1);
    } else if ((activeStep === 1 && !fromCartSidebar) || (activeStep === 0 && fromCartSidebar)) {
      if (validateForm()) setActiveStep(fromCartSidebar ? 1 : 2);
    } else if ((activeStep === 2 && !fromCartSidebar) || (activeStep === 1 && fromCartSidebar)) {
      if (paymentMethod === "online" && isFirstOrder && !isPromoResolved) {
        setError("Please wait while we apply your welcome discount");
        setSnackbarOpen(true);
        return;
      }
      if (paymentMethod === "online") handlePayment();
      else handleCOD();
    }
  }, [activeStep, fromCartSidebar, validateForm, paymentMethod, handlePayment, handleCOD, isFirstOrder, isPromoResolved]);

  const handleBackStep = useCallback(() => {
    setActiveStep(prev => prev - 1);
    setFormErrors({});
    setError("");
  }, []);

  if (!isInitialized) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress size={60} sx={{ color: colors.primary }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", background: `linear-gradient(135deg, ${colors.background} 0%, #f8f9fa 100%)`, py: 4 }}>
      <Container maxWidth="lg" sx={{ py: 4, minHeight: "80vh" }}>
        {loading && (
          <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, bgcolor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, backdropFilter: "blur(4px)" }}>
            <Box sx={{ textAlign: "center" }}>
              <CircularProgress size={60} sx={{ color: colors.primary, mb: 2 }} />
              <Typography variant="h6" color="white" fontWeight={600}>Processing Your Order...</Typography>
              <Typography variant="body2" color="white" sx={{ mt: 1, opacity: 0.8 }}>Please wait while we secure your payment</Typography>
            </Box>
          </Box>
        )}
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
          <Alert severity="error" sx={{ width: "100%", borderRadius: 2, boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }} onClose={() => setSnackbarOpen(false)}>
            {error}
          </Alert>
        </Snackbar>
        <Box>
          <Stepper activeStep={activeStep} orientation={isMobile ? "vertical" : "horizontal"} sx={{
            mb: 4,
            "& .MuiStepIcon-root": { fontSize: "1.8rem", color: colors.border, "&.Mui-completed": { color: colors.success }, "&.Mui-active": { color: colors.primary } },
            "& .MuiStepLabel-label": { fontWeight: 700, fontSize: "0.95rem", "&.Mui-completed": { color: colors.success }, "&.Mui-active": { color: colors.primary }, "&.Mui-disabled": { color: colors.icon } },
            "& .MuiStepConnector-line": { borderColor: colors.border }
          }}>
            {steps.map(({ label, icon }) => (
              <Step key={label}><StepLabel icon={icon}>{label}</StepLabel></Step>
            ))}
          </Stepper>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            {activeStep === 0 && !fromCartSidebar && (
              <OrderSummary items={items} showSuccess={showSuccess} totalSavings={totalSavings} formatIndianNumber={formatIndianNumber} colors={colors} fromBuyNow={fromBuyNow} />
            )}
            {((activeStep === 1 && !fromCartSidebar) || (activeStep === 0 && fromCartSidebar)) && (
              <ShippingDetailsForm formData={formData} formErrors={formErrors} onChange={handleInputChange} colors={colors} shippingCost={shippingCost} paymentMethod={paymentMethod} formatIndianNumber={formatIndianNumber} />
            )}
            {((activeStep === 2 && !fromCartSidebar) || (activeStep === 1 && fromCartSidebar)) && (
              <>
                <PromoCodeSection promoCode={promoCode} setPromoCode={setPromoCode} applyPromoCode={applyPromoCode} promoError={promoError} promoApplied={promoApplied} promoLoading={promoLoading} colors={colors} showSuccess={showSuccess} isFirstOrder={isFirstOrder} />
                <PaymentMethodForm paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} colors={colors} showSuccess={showSuccess} />
              </>
            )}
          </Grid>
          <Grid item xs={12} lg={4}>
            <PaymentSummary
              activeStep={activeStep} fromCartSidebar={fromCartSidebar} subtotal={subtotal} totalSavings={totalSavings} shippingCost={shippingCost} finalTotal={finalTotal}
              colors={colors} loading={loading} handleProceed={handleProceed} handleBackStep={handleBackStep} paymentMethod={paymentMethod} formatIndianNumber={formatIndianNumber}
              showSuccess={showSuccess} promoDiscount={promoDiscount} promoApplied={promoApplied} isFirstOrder={isFirstOrder} isPromoResolved={isPromoResolved}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Checkout;