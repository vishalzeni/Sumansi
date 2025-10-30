import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Skeleton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Chip,
  CircularProgress,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link, useNavigate } from "react-router-dom";
import colors from "../colors";
import Header from "./Header";
import Footer from "./Footer";
import { UserContext } from "../App";
import { API_BASE_URL } from "../config";
import { styled } from "@mui/system";
import { useCart } from "../hooks/useCart";

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

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogProduct, setDialogProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { addToCart = () => {} } = useCart() || {};

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user) {
      navigate("/login");
      return;
    }
    setLoading(true);
    const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
    fetch(`${API_BASE_URL}/wishlist`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setWishlistItems(
          (Array.isArray(data) ? data : []).filter((item) => item.product)
        );
      })
      .catch((err) => {
        setWishlistItems([]);
        console.error("Error fetching wishlist:", err);
      })
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleRemoveFromWishlist = async (productId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
    try {
      const res = await fetch(`${API_BASE_URL}/wishlist/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });
      const result = await res.json();
      if (result.wishlisted === false) {
        setWishlistItems((prev) =>
          prev.filter((item) => item.product.id !== productId)
        );
      }
    } catch (err) {
      console.error("Error removing wishlist item:", err);
    }
  };

  const handleAddToCartClick = (product) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setDialogProduct(product);
    setSelectedSize("");
    setSelectedColor(product.colors?.length === 1 ? product.colors[0] : "");
    setQuantity(1);
    setDialogOpen(true);
  };

  const handleDialogAddToCart = () => {
    if (dialogProduct && selectedSize && selectedColor) {
      addToCart(dialogProduct, quantity, selectedSize, selectedColor);
      setDialogOpen(false);
    }
  };

  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(4)].map((_, i) => (
        <Grid item key={i} xs={12} sm={6} md={4} lg={3}>
          <Skeleton
            variant="rectangular"
            sx={{
              width: "100%",
              aspectRatio: "1/1",
              borderRadius: 2,
              mb: 1,
            }}
          />
          <Skeleton variant="text" width="80%" height={24} />
          <Skeleton variant="text" width="60%" height={20} />
        </Grid>
      ))}
    </Grid>
  );

  const EmptyState = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 8,
        textAlign: "center",
        background: `linear-gradient(135deg, ${colors.background} 0%, rgba(255,255,255,0.8) 100%)`,
        borderRadius: 2,
        mx: { xs: 2, sm: 4 },
      }}
    >
      <FavoriteIcon sx={{ fontSize: 60, color: colors.primary, mb: 2 }} />
      <Typography
        variant="h5"
        sx={{
          color: colors.primary,
          mb: 1,
          fontWeight: 600,
        }}
      >
        Your Wishlist is Empty
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: "text.secondary",
          maxWidth: 400,
          lineHeight: 1.6,
        }}
      >
        Start adding your favorite products to create your perfect wishlist!
      </Typography>
      <Link to="/" style={{ textDecoration: "none" }}>
        <Typography
          variant="body2"
          sx={{
            mt: 2,
            color: colors.primary,
            fontWeight: 500,
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Explore Products
        </Typography>
      </Link>
    </Box>
  );

  return (
    <>
      <Header />
      <Box
        sx={{
          p: { xs: 2, sm: 3, md: 4, lg: 6 },
          background: `linear-gradient(135deg, ${colors.background} 0%, rgba(255,255,255,0.8) 100%)`,
          minHeight: "100vh",
          maxWidth: "1440px",
          mx: "auto",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 20% 50%, ${colors.primary}05 0%, transparent 50%)`,
            pointerEvents: "none",
            zIndex: 0,
          },
        }}
      >
        <Box sx={{ textAlign: "center", mb: 5, position: "relative", zIndex: 1 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(45deg, ${colors.primary}, ${colors.primary}CC)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              position: "relative",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: -8,
                left: "50%",
                transform: "translateX(-50%)",
                width: 60,
                height: 3,
                backgroundColor: colors.primary,
                borderRadius: 2,
              },
            }}
          >
            Your Wishlist
          </Typography>
        </Box>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: colors.primary }} />
          </Box>
        ) : wishlistItems.length === 0 ? (
          <EmptyState />
        ) : (
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            {wishlistItems.map(({ product }) => (
              <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
                <PremiumCard>
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      zIndex: 2,
                    }}
                  >
                    <IconButton
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      sx={{
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                        "&:hover": {
                          backgroundColor: "rgba(255, 255, 255, 0.9)",
                        },
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                      }}
                    >
                      <FavoriteIcon sx={{ color: colors.badge }} />
                    </IconButton>
                  </div>
                  <Link
                    to={`/product/${product.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <CardMedia
                      component="img"
                      image={product.image}
                      alt={product.name}
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
                        {product.name}
                      </Typography>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          variant="h6"
                          sx={{ color: colors.primary }}
                        >
                          ₹{product.price}
                        </Typography>
                        {product.marketPrice > product.price && (
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
                              ₹{product.marketPrice}
                            </Typography>
                            <Chip
                              label={`${Math.round(
                                ((product.marketPrice - product.price) /
                                  product.marketPrice) *
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
                      onClick={() => handleAddToCartClick(product)}
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
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            marginBottom: "0.5rem",
            color: colors.primary,
            fontSize: "1.1rem",
            borderBottom: `1px solid ${colors.border}`,
            pb: 2,
          }}
        >
          Select Size, Color & Quantity
        </DialogTitle>
        <DialogContent sx={{ py: 3, px: 3 }}>
          <Stack spacing={2}>
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
                    backgroundColor:
                      selectedSize === size ? colors.primary : "#fff",
                    color: selectedSize === size ? "#fff" : colors.primary,
                    border: `1px solid ${colors.primary}`,
                    cursor: "pointer",
                    "&:hover": {
                      transform: "scale(1.05)",
                      transition: "0.2s",
                      backgroundColor: colors.primary,
                    },
                  }}
                />
              ))}
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {dialogProduct?.colors?.map((color) => (
                <Box
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    backgroundColor: color,
                    border:
                      selectedColor === color
                        ? `2px solid ${colors.primary}`
                        : "1px solid #ccc",
                    cursor: "pointer",
                    "&:hover": {
                      borderColor: colors.primary,
                    },
                    boxShadow:
                      selectedColor === color
                        ? `0 0 0 2px ${colors.primary}33`
                        : "none",
                  }}
                />
              ))}
            </Stack>
            <TextField
              label="Quantity"
              type="number"
              size="small"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
              inputProps={{ min: 1, style: { width: 60 } }}
              sx={{
                width: 120,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  borderColor: colors.primary,
                },
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{ color: colors.primary, fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDialogAddToCart}
            disabled={!selectedSize || !selectedColor}
            sx={{
              background: colors.primary,
              color: colors.badgeText,
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
              "&:hover": {
                background: `linear-gradient(135deg, ${colors.primary}, #a83200)`,
              },
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
      <Footer />
    </>
  );
};

export default WishlistPage;