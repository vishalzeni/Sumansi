import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Chip,
  IconButton,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/system";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import CategoryIcon from "@mui/icons-material/Category";
import colors from "../colors";
import Wishlist from "./Wishlist"; // Import Wishlist component
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useCart } from "../hooks/useCart";
import { API_BASE_URL } from "../config";

const groupByCategory = (items) => {
  const grouped = {};
  items.forEach((item) => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });
  return grouped;
};

const PremiumCard = styled(Card)(({ theme }) => ({
  width: 300,
  borderRadius: 12,
  overflow: "visible",
  position: "relative",
  background: colors.cardBg,
  border: `1px solid ${colors.border}`,
  "&:hover": {
    boxShadow: "0 10px 15px rgba(0,0,0,0.15)",
  },
  [theme.breakpoints.down("sm")]: {
    width: 270,
  },
}));

const ClothingGallery = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); // <-- add loading state
  const groupedItems = groupByCategory(data);
  const scrollRefs = useRef({});
  const [showNav, setShowNav] = useState({});
  const { addToCart = () => {} } = useCart() || {};
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogProduct, setDialogProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(""); // <-- add state
  const [quantity, setQuantity] = useState(1);
  const [cartLoading, setCartLoading] = useState(false);

  const isMobile = window.innerWidth <= 600;

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/products/gallery-products?per_category=10`)
      .then((res) => res.json())
      .then((res) => {
        setData(res.products || []);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const checkOverflow = () => {
      const result = {};
      Object.keys(scrollRefs.current).forEach((category) => {
        const el = scrollRefs.current[category];
        if (el && el.scrollWidth > el.clientWidth) {
          result[category] = true;
        } else {
          result[category] = false;
        }
      });
      setShowNav(result);
    };
    setTimeout(checkOverflow, 100);
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [groupedItems]);

  const handleScroll = (category, direction) => {
    const container = scrollRefs.current[category];
    if (container) {
      container.scrollBy({
        left: direction === "left" ? -300 : 300,
        behavior: "smooth",
      });
    }
  };

  const handleAddToCartClick = (item) => {
    // Check login before opening dialog
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setDialogProduct(item);
    setSelectedSize("");
    setQuantity(1);
    setSelectedColor(item.colors?.length === 1 ? item.colors[0] : "");
    setDialogOpen(true);
  };

 const handleDialogAddToCart = async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "/login";
    return;
  }

  if (dialogProduct && selectedSize && selectedColor) {
    try {
      setCartLoading(true);
      await addToCart(dialogProduct, quantity, selectedSize, selectedColor);
      setDialogOpen(false);
    } finally {
      setCartLoading(false);
    }
  }
};


  return (
    <Box
      sx={{
        px: { xs: 1, md: 4 },
        py: { xs: 4, md: 6 },
        bgcolor: colors.background,
        backgroundImage:
          "radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 300,
          }}
        >
          <CircularProgress sx={{ color: colors.primary }} />
        </Box>
      ) : (
        Object.entries(groupedItems).map(([category, items]) => (
          <Box key={category} sx={{ mb: 6 }}>
            <Box
              sx={{
                borderLeft: `4px solid ${colors.primary}`,
                pl: 2,
                mb: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1, // underline ke liye spacing
                }}
              >
                <CategoryIcon
                  sx={{
                    color: colors.primary,
                    fontSize: "1.6rem",
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    color: colors.primary,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  {category}
                </Typography>
              </Box>

              {/* Gradient Underline */}
              <Box
                sx={{
                  width: "60px",
                  height: "3px",
                  borderRadius: 2,
                  background: `linear-gradient(90deg, ${colors.primary}, #ff6f61)`,
                }}
              />
            </Box>

            <Box sx={{ position: "relative" }}>
              {showNav[category] && (
                <IconButton
                  onClick={() => handleScroll(category, "left")}
                  sx={{
                    position: "absolute",
                    left: -28,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 2,
                    backgroundColor: "#fff",
                    color: colors.primary,
                    borderRadius: "50%",
                    width: 44,
                    height: 44,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                    display: { xs: "none", md: "flex" },
                    alignItems: "center",
                    justifyContent: "center",
                    "&:hover": {
                      backgroundColor: colors.primary,
                      color: "#fff",
                    },
                  }}
                >
                  <ChevronLeft />
                </IconButton>
              )}

              <Box
                ref={(el) => (scrollRefs.current[category] = el)}
                sx={{
                  display: "flex",
                  overflowX: "auto",
                  gap: { xs: 2, md: 3 },
                  px: { xs: 1, md: 2 },
                  pb: 3,
                  scrollSnapType: "x mandatory",
                  "&::-webkit-scrollbar": { display: "none" },
                  scrollbarWidth: "none",
                }}
              >
                {items.map((item) => (
                  <Box
                    key={item.id}
                    sx={{ flex: "0 0 auto", scrollSnapAlign: "start", mt: 2 }}
                  >
                    <PremiumCard>
                      <div
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          zIndex: 2,
                        }}
                      >
                        <Wishlist productId={item.id} />
                      </div>
                      <Link
                        to={`/product/${item.id}`}
                        style={{ textDecoration: "none" }}
                      >
                        <CardMedia
                          component="img"
                          image={item.image}
                          alt={item.name}
                          sx={{
                            height: "auto",
                            objectFit: "cover",
                            borderTopLeftRadius: 12,
                            borderTopRightRadius: 12,
                          }}
                        />
                        <CardContent sx={{ p: { xs: 2, sm: 2 } }}>
                          <Typography
                            variant="body"
                            sx={{
                              color: colors.primary,
                              fontWeight: 600,
                              fontSize: { xs: "1rem", sm: "1.1rem" },
                              lineHeight: 1.3,
                              transition: "all 0.3s ease",
                              display: "-webkit-box",
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              minHeight: "1.3em",
                              textOverflow: "ellipsis",
                              cursor: "pointer",
                              userSelect: "none",
                              textAlign: "left",
                            }}
                          >
                            {item.name}
                          </Typography>
                          <Box sx={{ textAlign: "center" }}>
                            <Typography
                              variant="h6"
                              sx={{ color: colors.primary }}
                            >
                              ₹{item.price.toLocaleString()}
                            </Typography>
                            {item.marketPrice > item.price && (
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  gap: 1,
                                  mt: 0.5,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "#888",
                                    textDecoration: "line-through",
                                  }}
                                >
                                  ₹{item.marketPrice}
                                </Typography>
                                <Chip
                                  label={`${Math.round(
                                    ((item.marketPrice - item.price) /
                                      item.marketPrice) *
                                      100
                                  )}% OFF`}
                                  size="small"
                                  sx={{
                                    backgroundColor: "rgba(190, 57, 0, 0.1)",
                                    color: colors.primary,
                                    fontWeight: 600,
                                    fontSize: "0.75rem",
                                  }}
                                />
                              </Box>
                            )}
                          </Box>
                        </CardContent>
                      </Link>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          mb: 2,
                        }}
                      >
                        <Button
                          variant="outlined"
                          startIcon={<ShoppingCartIcon />}
                          onClick={() => handleAddToCartClick(item)}
                          sx={{
                            borderColor: colors.primary,
                            color: colors.primary,
                            borderRadius: 2,
                            fontWeight: 600,
                            "&:hover": {
                              background: colors.primary,
                              color: "#fff",
                            },
                          }}
                        >
                          Add to Cart
                        </Button>
                      </Box>
                    </PremiumCard>
                  </Box>
                ))}
              </Box>

              {showNav[category] && (
                <IconButton
                  onClick={() => handleScroll(category, "right")}
                  sx={{
                    position: "absolute",
                    right: -28,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 2,
                    backgroundColor: "#fff",
                    color: colors.primary,
                    borderRadius: "50%",
                    width: 44,
                    height: 44,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                    display: { xs: "none", md: "flex" },
                    alignItems: "center",
                    justifyContent: "center",
                    "&:hover": {
                      backgroundColor: colors.primary,
                      color: "#fff",
                    },
                  }}
                >
                  <ChevronRight />
                </IconButton>
              )}
            </Box>
            <Box sx={{ mt: 2 }}>
              <Link
                to={`/category/${encodeURIComponent(category)}`}
                style={{ textDecoration: "none" }}
              >
                <Box
                  component="button"
                  sx={{
                    backgroundColor: colors.primary,
                    color: colors.badgeText,
                    px: 3.5,
                    py: 1.5,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    border: "none",
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "#a83200",
                    },
                  }}
                >
                  View All
                </Box>
              </Link>
            </Box>
            <Divider
              sx={{
                my: 4,
                borderBottomWidth: "2px",
                borderColor: colors.border,
              }}
            />
          </Box>
        ))
      )}
      {/* ✅ Add to Cart Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            backgroundColor: colors.cardBg, // optional for theming
          },
        }}
      >
        {/* 🔹 Dialog Title */}
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: colors.primary,
            fontSize: isMobile ? "1rem" : "1.1rem",
            borderBottom: `1px solid ${colors.border}`,
            pb: 2,
            mb: 1,
          }}
        >
          Select Size, Color & Quantity
        </DialogTitle>

        {/* 🔹 Dialog Content */}
        <DialogContent sx={{ py: 2, px: 3 }}>
          <Stack spacing={2.5}>
            {/* Size Selector */}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: colors.textSecondary,
                  mb: 0.5,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                Select Size
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                {dialogProduct?.sizes?.map((size) => (
                  <Chip
                    key={size}
                    label={size}
                    clickable
                    onClick={() => setSelectedSize(size)}
                    sx={{
                      px: 2,
                      py: 0.5,
                      fontWeight: 600,
                      borderRadius: 2,
                      border: `1px solid ${colors.primary}`,
                      backgroundColor:
                        selectedSize === size ? colors.primary : "#fff",
                      color: selectedSize === size ? "#fff" : colors.primary,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: colors.primary,
                        color: "#fff",
                        transform: "scale(1.05)",
                      },
                    }}
                  />
                ))}
              </Stack>
            </Box>

            {/* Color Selector */}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: colors.textSecondary,
                  mb: 0.5,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                Select Color
              </Typography>

              <Stack direction="row" spacing={1.5} flexWrap="wrap">
                {dialogProduct?.colors?.map((color) => (
                  <Box
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      backgroundColor: color,
                      border:
                        selectedColor === color
                          ? `2px solid ${colors.primary}`
                          : `1px solid ${colors.border}`,
                      boxShadow:
                        selectedColor === color
                          ? `0 0 0 2px ${colors.primary}33`
                          : "none",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "scale(1.1)",
                        boxShadow: `0 0 0 2px ${colors.primary}33`,
                      },
                    }}
                  />
                ))}
              </Stack>
            </Box>

            {/* Quantity Selector */}
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: colors.textSecondary,
                  mb: 0.5,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                Quantity
              </Typography>

              <TextField
                type="number"
                size="small"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                inputProps={{ min: 1 }}
                sx={{
                  width: 100,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "& fieldset": {
                      borderColor: colors.primary,
                    },
                    "&:hover fieldset": {
                      borderColor: colors.primaryHover || colors.primary,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: colors.primary,
                      borderWidth: 2,
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: colors.textPrimary,
                    textAlign: "center",
                    fontWeight: 600,
                  },
                }}
              />
            </Box>
          </Stack>
        </DialogContent>

        {/* 🔹 Dialog Actions */}
        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{
              color: colors.primary,
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
  variant="contained"
  onClick={handleDialogAddToCart}
  disabled={!selectedSize || !selectedColor || cartLoading}
  sx={{
    background: colors.primary,
    color: colors.badgeText,
    fontWeight: 700,
    borderRadius: 2,
    px: 3,
    textTransform: "none",
    "&:hover": {
      background: `linear-gradient(135deg, ${colors.primary}, ${
        colors.primaryDark || "#a83200"
      })`,
    },
  }}
>
  {cartLoading ? (
    <CircularProgress size={22} sx={{ color: colors.badgeText }} />
  ) : (
    "Add"
  )}
</Button>

        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClothingGallery;
