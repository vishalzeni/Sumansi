import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ImageMagnifier from "../utilities/ImageMagnifier";
import { useCart } from "../hooks/useCart";
import { API_BASE_URL } from "../config";
import { UserContext } from "../App";
import {
  Box,
  Typography,
  Chip,
  Button,
  Stack,
  Grid,
  Paper,
  Rating,
  IconButton,
  useMediaQuery,
  useTheme,
  Fade,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  TextField,
  Avatar,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import {
  Add,
  Remove,
  LocalShipping,
  ShoppingCartOutlined,
  ExpandMore,
  InfoOutlined,
} from "@mui/icons-material";
import colors from "../colors";
import Header from "./Header";
import Footer from "./Footer";
import Wishlist from "./Wishlist";
import { useNavigate } from "react-router-dom";


const ProductDetail = () => {
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageTransition, setImageTransition] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const { addToCart } = useCart();
  const { user } = React.useContext(UserContext);
  const navigate = useNavigate();
  
  // New states for loading and error handling
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Enhanced fetch function with error handling
  const fetchProductData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/products/productsDetail?id=${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.status}`);
      }
      
      const data = await response.json();
      const prod = (data.products || []).find((item) => item.id === id);
      
      if (!prod) {
        throw new Error("Product not found");
      }
      
      setProduct(prod);
      setMainImage(prod?.image || "");
      setReviews(prod?.reviews || []);
      if (prod?.colors?.length === 1) setSelectedColor(prod.colors[0]);
      
    } catch (err) {
      console.error("Error fetching product:", err);
      setError(err.message);
      setSnackbar({
        open: true,
        message: "Failed to load product. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch product and reviews from backend
  useEffect(() => {
    fetchProductData();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <>
        <Header />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
            backgroundColor: colors.background,
          }}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress 
              size={60} 
              sx={{ color: colors.primary }}
            />
            <Typography variant="h6" color="text.secondary">
              Loading product...
            </Typography>
          </Stack>
        </Box>
        <Footer />
      </>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <>
        <Header />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
            backgroundColor: colors.background,
            p: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            {error || "Product not found"}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            We couldn't load the product details. Please check the product ID or try again later.
          </Typography>
          <Button 
            variant="contained" 
            onClick={fetchProductData}
            sx={{
              mt: 2,
              background: `linear-gradient(90deg, ${colors.primary} 0%, #ff7043 100%)`,
            }}
          >
            Try Again
          </Button>
        </Box>
        <Footer />
      </>
    );
  }

  const discount =
    product.marketPrice > product.price
      ? Math.round(
          ((product.marketPrice - product.price) / product.marketPrice) * 100
        )
      : 0;

  const allImages = [
    product.image,
    ...(product.images?.filter((img) => img !== product.image) || []),
  ];

  const handleNextImage = () => {
    setImageTransition(true);
    setTimeout(() => {
      const nextIndex = (currentImageIndex + 1) % allImages.length;
      setCurrentImageIndex(nextIndex);
      setMainImage(allImages[nextIndex]);
      setImageTransition(false);
    }, 300);
  };

  const handlePrevImage = () => {
    setImageTransition(true);
    setTimeout(() => {
      const prevIndex =
        (currentImageIndex - 1 + allImages.length) % allImages.length;
      setCurrentImageIndex(prevIndex);
      setMainImage(allImages[prevIndex]);
      setImageTransition(false);
    }, 300);
  };

  // Enhanced add to cart function with error handling
  const handleAddToCart = async () => {
    if (!user) {
      setSnackbar({
        open: true,
        message: "Please login to add items to cart",
        severity: "warning",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
      return;
    }

    if (!selectedSize) {
      setSnackbar({
        open: true,
        message: "Please select a size",
        severity: "warning",
      });
      return;
    }

    try {
      await addToCart(product, quantity || 1, selectedSize, selectedColor);
      setSnackbar({
        open: true,
        message: "Product added to cart successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Error adding to cart:", err);
      setSnackbar({
        open: true,
        message: "Failed to add product to cart. Please try again.",
        severity: "error",
      });
    }
  };

  // Submit review to backend with enhanced error handling
  const handleReviewSubmit = async () => {
    if (!user) {
      setSnackbar({
        open: true,
        message: "Please login to submit a review",
        severity: "warning",
      });
      return;
    }
    
    if (reviewText.trim() && reviewRating > 0) {
      setReviewLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/products/${product._id}/reviews`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.accessToken}`,
            },
            credentials: "include",
            body: JSON.stringify({
              rating: reviewRating,
              comment: reviewText,
              userId: user.userId,
              userName: user.name,
              userAvatar: user.avatar || "",
            }),
          }
        );
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Failed to submit review");
        }
        
        setReviewText("");
        setReviewRating(0);
        setSnackbar({
          open: true,
          message: "Review submitted successfully!",
          severity: "success",
        });
        
        // Fetch updated reviews
        await fetchProductData();
        
      } catch (err) {
        console.error("Error submitting review:", err);
        setSnackbar({
          open: true,
          message: err.message || "Failed to submit review. Please try again.",
          severity: "error",
        });
      } finally {
        setReviewLoading(false);
      }
    } else {
      setSnackbar({
        open: true,
        message: "Please add a rating and review text",
        severity: "warning",
      });
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Header />
      <Box
        sx={{
          position: "relative",
          backgroundColor: colors.background,
          minHeight: "calc(100vh - 64px)",
          paddingTop: isMobile ? 0 : 2,
          paddingBottom: isMobile ? "100px" : "64px",
          px: { xs: 0, md: 2 },
        }}
      >
        <Grid container justifyContent="center">
          <Grid item xs={12} md={11} lg={10}>
            <Fade in timeout={500}>
              <Grid
                container
                spacing={isMobile ? 0 : 1}
                direction={isMobile ? "column" : "row"}
                alignItems="stretch"
                justifyContent={"center"}
              >
                {/* LEFT: Product Image */}
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      position: "relative",
                      borderRadius: isMobile ? 0 : 3,
                      overflow: "hidden",
                      backgroundColor: "#fef4ee",
                      height: isMobile
                        ? isSmallMobile
                          ? "60vh"
                          : "70vh"
                        : 560,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: isMobile
                        ? "none"
                        : "0 4px 24px rgba(0,0,0,0.08)",
                      border: isMobile ? "none" : "1px solid #f0e6e0",
                      mb: isMobile ? 2 : 2,
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 16,
                        left: 16,
                        right: 16,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        zIndex: 10,
                      }}
                    >
                      {product.isNewArrival && (
                        <Chip
                          label="New Arrival"
                          sx={{
                            backgroundColor: colors.badge,
                            color: colors.badgeText,
                            fontWeight: 600,
                            fontSize: isMobile ? "0.65rem" : "0.7rem",
                            borderRadius: 1,
                            px: 1,
                          }}
                          size="small"
                        />
                      )}
                      <Wishlist productId={product.id} />
                    </Box>

                    {/* Main Image with Arrows */}
                    <Box
                      sx={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      {isMobile ? (
                        <Box
                          component="img"
                          src={mainImage}
                          alt="Product"
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            transition: "opacity 0.3s ease-in-out",
                            opacity: imageTransition ? 0 : 1,
                          }}
                        />
                      ) : (
                        <ImageMagnifier
                          src={mainImage}
                          zoom={2.5}
                          magnifierSize={150}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            transition: "opacity 0.3s ease-in-out",
                            opacity: imageTransition ? 0 : 1,
                          }}
                        />
                      )}
                      <IconButton
                        onClick={handlePrevImage}
                        sx={{
                          position: "absolute",
                          left: 8,
                          top: "50%",
                          transform: "translateY(-50%)",
                          backgroundColor: "rgba(255,255,255,0.9)",
                          color: colors.primary,
                          border: `1px solid ${colors.primary}`,
                          borderRadius: "50%",
                          width: 32,
                          height: 32,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          ":hover": {
                            backgroundColor: colors.accent,
                            transform: "translateY(-50%) scale(1.05)",
                          },
                          transition: "0.3s",
                        }}
                      >
                        <ArrowBackIosIcon
                          sx={{ fontSize: "0.9rem", ml: "0.4rem" }}
                        />
                      </IconButton>
                      <IconButton
                        onClick={handleNextImage}
                        sx={{
                          position: "absolute",
                          right: 8,
                          top: "50%",
                          transform: "translateY(-50%)",
                          backgroundColor: "rgba(255,255,255,0.9)",
                          color: colors.primary,
                          border: `1px solid ${colors.primary}`,
                          borderRadius: "50%",
                          width: 32,
                          height: 32,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          ":hover": {
                            backgroundColor: colors.accent,
                            transform: "translateY(-50%) scale(1.05)",
                          },
                          transition: "0.3s",
                        }}
                      >
                        <ArrowForwardIosIcon sx={{ fontSize: "0.9rem" }} />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Thumbnails */}
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="center"
                    sx={{
                      overflowX: "auto",
                      pb: 1,
                      px: isMobile ? 1 : 0,
                      mt: 1,
                      backgroundColor: isMobile ? "transparent" : "#fff",
                      borderRadius: 1,
                      py: 1,
                    }}
                  >
                    {allImages.map((img, index) => (
                      <Box
                        key={index}
                        component="img"
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        onClick={() => {
                          setImageTransition(true);
                          setTimeout(() => {
                            setMainImage(img);
                            setCurrentImageIndex(index);
                            setImageTransition(false);
                          }, 300);
                        }}
                        sx={{
                          width: isMobile ? 48 : 64,
                          height: isMobile ? 48 : 64,
                          borderRadius: 2,
                          objectFit: "cover",
                          border:
                            mainImage === img
                              ? `2px solid ${colors.primary}`
                              : "1px solid #ccc",
                          cursor: "pointer",
                          transition: "0.3s",
                          ":hover": {
                            opacity: 0.9,
                            borderColor: colors.primary,
                            transform: "scale(1.05)",
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </Grid>

                {/* RIGHT: Product Details */}
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={isMobile ? 0 : 2}
                    sx={{
                      p: { xs: 2, md: 4 },
                      borderRadius: isMobile ? 0 : 4,
                      backgroundColor: isMobile ? "transparent" : colors.cardBg,
                      boxShadow: isMobile
                        ? "none"
                        : "0px 6px 20px rgba(0, 0, 0, 0.05)",
                      height: "100%",
                      transition: "0.3s",
                      minWidth: isMobile ? "100%" : 600,
                    }}
                  >
                    <Stack spacing={3} sx={{ height: "100%" }}>
                      <Box>
                        <Typography
  component="h1"
  variant={isMobile ? "h5" : "h4"}
  fontWeight={600}
  color={colors.icon}
  mb={1}
  textAlign="left"
  sx={{
    pt: isMobile ? 1 : 0,
    fontSize: isSmallMobile
      ? "1rem"
      : isMobile
      ? "1.25rem"
      : "1.5rem",

    // 👇 key part for wrapping
    maxWidth: isMobile ? "350px" : "600px", // set your preferred width
    whiteSpace: "normal", // allows line breaks
    wordBreak: "break-word", // breaks long words if needed
    overflowWrap: "break-word", // ensures text wraps within width
  }}
>
  {product.name}
</Typography>


                        {/* Price */}
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography
                            fontWeight={700}
                            sx={{
                              color: colors.primary,
                              fontSize: isMobile ? "1.4rem" : "1.6rem",
                            }}
                          >
                            ₹{product.price.toLocaleString()}
                          </Typography>
                          {discount > 0 && (
                            <>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#888",
                                  textDecoration: "line-through",
                                  fontSize: isMobile ? "0.9rem" : "1rem",
                                }}
                              >
                                ₹{product.marketPrice.toLocaleString()}
                              </Typography>
                              <Chip
                                label={`${discount}% OFF`}
                                size="small"
                                sx={{
                                  backgroundColor: "#fff0e9",
                                  color: colors.primary,
                                  fontWeight: 600,
                                  borderRadius: 2,
                                  px: 1.5,
                                }}
                              />
                            </>
                          )}
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <InfoOutlined fontSize="small" color="action" />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              textAlign: "left",
                              fontSize: isMobile ? "0.75rem" : "0.875rem",
                            }}
                          >
                            Inclusive of all taxes. Free shipping over ₹999.
                          </Typography>
                        </Stack>
                        {/* Ratings */}
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          mt={1}
                        >
                          <Rating
                            value={5}
                            readOnly
                            size={isMobile ? "small" : "medium"}
                          />
                          <Typography variant="body2" color="text.secondary">
                            (5.0)
                          </Typography>
                        </Stack>
                      </Box>

                      <Divider sx={{ borderColor: colors.border }} />

                      {/* Sizes */}
                      <Box>
                        <Typography
                          fontWeight={600}
                          gutterBottom
                          style={{ textAlign: "left" }}
                          sx={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
                        >
                          Select Size:
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          {product.sizes.map((size) => (
                            <Chip
                              key={size}
                              label={size}
                              clickable
                              onClick={() => setSelectedSize(size)}
                              variant={
                                selectedSize === size ? "filled" : "outlined"
                              }
                              sx={{
                                px: 2,
                                py: isMobile ? 0.5 : 1,
                                fontWeight: 600,
                                borderRadius: 2,
                                backgroundColor:
                                  selectedSize === size
                                    ? colors.primary
                                    : "transparent",
                                color:
                                  selectedSize === size
                                    ? "#fff"
                                    : colors.primary,
                                borderColor: colors.primary,
                                transition: "all 0.3s ease",
                                fontSize: isMobile ? "0.85rem" : "1rem",
                                mb: 1,
                                ":hover": {
                                  transform: "scale(1.05)",
                                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                                },
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>

                      {/* Colors */}
                      <Box>
                        <Typography
                          fontWeight={600}
                          gutterBottom
                          style={{ textAlign: "left" }}
                          sx={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
                        >
                          Select Color:
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          {(product.colors || []).map((color) => (
                            <Box
                              key={color}
                              onClick={() => setSelectedColor(color)}
                              sx={{
                                width: isMobile ? 20 : 24,
                                height: isMobile ? 20 : 24,
                                borderRadius: "50%",
                                background: color,
                                border:
                                  selectedColor === color
                                    ? `2px solid ${colors.primary}`
                                    : "1px solid #ccc",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                ":hover": {
                                  transform: "scale(1.1)",
                                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                                },
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>

                      {/* Quantity */}
                      <Box>
                        <Typography
                          fontWeight={600}
                          gutterBottom
                          style={{ textAlign: "left" }}
                          sx={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
                        >
                          Quantity:
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconButton
                            onClick={() =>
                              setQuantity((prev) => Math.max(1, prev - 1))
                            }
                            sx={{
                              border: `1px solid ${colors.primary}`,
                              color: colors.primary,
                              borderRadius: 2,
                              width: isMobile ? 32 : 36,
                              height: isMobile ? 32 : 36,
                              ":hover": {
                                backgroundColor: colors.accent,
                                transform: "scale(1.05)",
                              },
                              transition: "0.3s",
                            }}
                          >
                            <Remove
                              sx={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
                            />
                          </IconButton>
                          <Typography
                            variant="body1"
                            width={30}
                            textAlign="center"
                            sx={{
                              fontWeight: 500,
                              fontSize: isMobile ? "0.9rem" : "1rem",
                            }}
                          >
                            {quantity}
                          </Typography>
                          <IconButton
                            onClick={() => setQuantity((prev) => prev + 1)}
                            sx={{
                              border: `1px solid ${colors.primary}`,
                              color: colors.primary,
                              borderRadius: 2,
                              width: isMobile ? 32 : 36,
                              height: isMobile ? 32 : 36,
                              ":hover": {
                                backgroundColor: colors.accent,
                                transform: "scale(1.05)",
                              },
                              transition: "0.3s",
                            }}
                          >
                            <Add
                              sx={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
                            />
                          </IconButton>
                        </Stack>
                      </Box>

                      {/* Shipping Info */}
                      <Stack spacing={1}>
                        <Chip
                          icon={<LocalShipping fontSize="small" />}
                          label="Dispatch in 3–4 days"
                          sx={{
                            backgroundColor: "#fdf2ec",
                            color: colors.primary,
                            fontWeight: 500,
                            px: 1.5,
                            py: 1,
                            width: "fit-content",
                            borderRadius: 2,
                            fontSize: isMobile ? "0.75rem" : "0.875rem",
                          }}
                        />
                      </Stack>

                      {selectedSize && (
                        <Typography
                          variant="body2"
                          mt={0.5}
                          sx={{ fontSize: isMobile ? "0.85rem" : "0.875rem" }}
                        >
                          Selected Size:{" "}
                          <span
                            style={{ color: colors.primary, fontWeight: 500 }}
                          >
                            {selectedSize}
                          </span>
                        </Typography>
                      )}
                      {selectedColor && (
                        <Typography
                          variant="body2"
                          mt={0.5}
                          sx={{ fontSize: isMobile ? "0.85rem" : "0.875rem" }}
                        >
                          Selected Color:{" "}
                          <span
                            style={{ color: colors.primary, fontWeight: 500 }}
                          >
                            {selectedColor}
                          </span>
                        </Typography>
                      )}

                      {!isMobile && (
                        <Stack
                          direction="column"
                          spacing={1}
                          sx={{
                            flexWrap: "wrap",
                            gap: 1,
                            mt: 2,
                          }}
                        >
<Button
  variant="contained"
  disabled={!product.inStock || !selectedSize}
  onClick={() => {
    if (!selectedSize) {
      setSnackbar({
        open: true,
        message: "Please select a size",
        severity: "warning",
      });
      return;
    }
    // Pass flag to indicate from Buy Now
    navigate("/checkout", { 
      state: { 
        fromBuyNow: true,
        product: product,
        quantity: quantity,
        size: selectedSize,
        color: selectedColor
      } 
    });
  }}
  sx={{
    background: `linear-gradient(90deg, ${colors.primary} 0%, #ff7043 100%)`,
    fontWeight: 600,
    py: 1.4,
    borderRadius: 3,
    textTransform: "none",
    fontSize: "1rem",
    transition: "0.3s",
    ":hover": {
      transform: "scale(1.01)",
      background: "#a83200",
    },
  }}
>
  Buy Now
</Button>
                          <Button
                            variant="outlined"
                            disabled={!product.inStock || !selectedSize}
                            startIcon={<ShoppingCartOutlined />}
                            sx={{
                              fontWeight: 600,
                              py: 1.4,
                              borderColor: colors.primary,
                              color: colors.primary,
                              borderRadius: 3,
                              textTransform: "none",
                              fontSize: "1rem",
                              ":hover": {
                                backgroundColor: colors.accent,
                              },
                            }}
                            onClick={handleAddToCart}
                          >
                            Add to Cart
                          </Button>
                        </Stack>
                      )}
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </Fade>

            {/* Product Description and Reviews Section */}
            <Box sx={{ mt: 4, px: isMobile ? 2 : 0 }}>
              <Accordion
                sx={{
                  backgroundColor: isMobile ? "transparent" : "#fff",
                  borderRadius: 2,
                  border: isMobile ? "none" : "1px solid #f0e6e0",
                  boxShadow: "none",
                  transition: "0.3s",
                  ":hover": {
                    boxShadow: isMobile ? "none" : "0 4px 12px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography
                    fontWeight={600}
                    sx={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
                  >
                    Product Description
                  </Typography>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    backgroundColor: isMobile ? "transparent" : "#f9f9f9",
                    p: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    lineHeight={1.8}
                    color="text.secondary"
                    sx={{ fontSize: isMobile ? "0.85rem" : "0.875rem" }}
                  >
                    {product.description}
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion
                sx={{
                  backgroundColor: isMobile ? "transparent" : "#fff",
                  mt: 2,
                  borderRadius: 2,
                  border: isMobile ? "none" : "1px solid #f0e6e0",
                  boxShadow: "none",
                  transition: "0.3s",
                  ":hover": {
                    boxShadow: isMobile ? "none" : "0 4px 12px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography
                    fontWeight={600}
                    sx={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
                  >
                    Customer Reviews
                  </Typography>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    backgroundColor: isMobile ? "transparent" : "#f9f9f9",
                    p: 2,
                  }}
                >
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      gutterBottom
                      sx={{ fontSize: isMobile ? "0.9rem" : "1rem" }}
                    >
                      Write a Review
                    </Typography>
                    <Stack spacing={2}>
                      <Rating
                        value={reviewRating}
                        onChange={(event, newValue) =>
                          setReviewRating(newValue)
                        }
                        size={isMobile ? "medium" : "large"}
                      />
                      <TextField
                        multiline
                        rows={3}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Share your thoughts about the product..."
                        variant="outlined"
                        fullWidth
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            backgroundColor: "#fff",
                            transition: "0.3s",
                            ":hover": {
                              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                            },
                            fontSize: isMobile ? "0.85rem" : "0.875rem",
                          },
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={handleReviewSubmit}
                        disabled={
                          !reviewText.trim() ||
                          reviewRating === 0 ||
                          reviewLoading
                        }
                        sx={{
                          background: `linear-gradient(90deg, ${colors.primary} 0%, #ff7043 100%)`,
                          fontWeight: 600,
                          py: 1,
                          borderRadius: 2,
                          textTransform: "none",
                          width: "fit-content",
                          color: "#fff",
                          transition: "0.3s",
                          ":hover": {
                            background: "#a83200",
                            transform: "scale(1.05)",
                          },
                          fontSize: isMobile ? "0.85rem" : "0.875rem",
                          position: "relative",
                          minWidth: 120,
                        }}
                      >
                        {reviewLoading ? (
                          <CircularProgress size={22} sx={{ color: "#fff" }} />
                        ) : (
                          "Submit Review"
                        )}
                      </Button>
                    </Stack>
                  </Box>

                  {reviews.length === 0 ? (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        py: 3,
                        px: 2,
                        borderRadius: 2,
                        border: `1px dashed ${colors.border}`,
                        backgroundColor: "rgba(0,0,0,0.02)",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        mb={0.5}
                        sx={{ fontSize: isMobile ? "0.95rem" : "1rem" }}
                      >
                        No Reviews Yet
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        lineHeight={1.5}
                        sx={{ fontSize: isMobile ? "0.8rem" : "0.85rem" }}
                      >
                        Be the first to share your experience and help others!
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={2}>
                      {/* Header */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          fontWeight={600}
                          sx={{ fontSize: isMobile ? "0.95rem" : "1rem" }}
                        >
                          Reviews ({reviews.length})
                        </Typography>
                        <Rating
                          value={
                            reviews.reduce(
                              (acc, review) => acc + review.rating,
                              0
                            ) / reviews.length
                          }
                          readOnly
                          size="small"
                          precision={0.1}
                        />
                        <Typography variant="body2" color="text.secondary">
                          (
                          {(
                            reviews.reduce(
                              (acc, review) => acc + review.rating,
                              0
                            ) / reviews.length
                          ).toFixed(1)}
                          )
                        </Typography>
                      </Box>

                      {/* Reviews List */}
                      {reviews.map((review, index) => (
                        <Box
                          key={review.id || review._id || index}
                          sx={{
                            borderBottom: `1px solid ${colors.border}`,
                            pb: 1.5,
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="flex-start"
                          >
                            <Avatar
                              src={review.userAvatar || ""}
                              sx={{
                                bgcolor: colors.primary,
                                width: 32,
                                height: 32,
                                fontSize: "0.85rem",
                                fontWeight: 600,
                              }}
                            >
                              {review.userName
                                ? review.userName[0].toUpperCase()
                                : "U"}
                            </Avatar>

                            <Box sx={{ flex: 1 }}>
                              {/* Name + Rating */}
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                              >
                                <Typography
                                  variant="subtitle2"
                                  fontWeight={600}
                                  sx={{
                                    fontSize: isMobile ? "0.85rem" : "0.9rem",
                                  }}
                                >
                                  {review.userName ||
                                    review.user ||
                                    "Anonymous"}
                                </Typography>
                                <Rating
                                  value={review.rating}
                                  readOnly
                                  size="small"
                                  sx={{
                                    "& .MuiRating-iconFilled": {
                                      color: colors.primary,
                                    },
                                  }}
                                />
                              </Stack>

                              {/* Date */}
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  fontSize: "0.75rem",
                                  mt: 0.3,
                                  display: "block",
                                  textAlign: "left",
                                }}
                              >
                                {review.date || review.createdAt
                                  ? new Date(
                                      review.date || review.createdAt
                                    ).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })
                                  : "Recent"}
                              </Typography>

                              {/* Comment */}
                              <Typography
                                variant="body2"
                                color="text.primary"
                                sx={{
                                  mt: 0.8,
                                  fontSize: isMobile ? "0.85rem" : "0.9rem",
                                  lineHeight: 1.5,
                                  whiteSpace: "pre-line",
                                  textAlign: "left",
                                }}
                              >
                                {review.comment}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      ))}

                      {/* Load More */}
                      {reviews.length > 5 && (
                        <Button
                          variant="text"
                          sx={{
                            alignSelf: "flex-start",
                            fontSize: "0.85rem",
                            color: colors.primary,
                            fontWeight: 500,
                            textTransform: "none",
                          }}
                        >
                          Show More Reviews
                        </Button>
                      )}
                    </Stack>
                  )}
                </AccordionDetails>
              </Accordion>
            </Box>
          </Grid>
        </Grid>
        {isMobile && (
          <Box
            sx={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "#fff",
              px: 2,
              py: 1.5,
              zIndex: 1000,
              borderTop: `1px solid ${colors.border}`,
              boxShadow: "0 -4px 12px rgba(0,0,0,0.08)",
              transition: "0.3s",
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              justifyContent="space-between"
              alignItems="center"
            >
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ color: colors.primary }}
                >
                  ₹{product.price.toLocaleString()}
                </Typography>
                {discount > 0 && (
                  <Typography
                    variant="caption"
                    sx={{ color: "#888", textDecoration: "line-through" }}
                  >
                    ₹{product.marketPrice.toLocaleString()}
                  </Typography>
                )}
              </Box>

              <Stack direction="row" spacing={1} flex={1} maxWidth={300}>
                <Button
                  variant="outlined"
                  disabled={!product.inStock || !selectedSize || !selectedColor}
                  sx={{
                    flex: 1,
                    fontWeight: 600,
                    py: 1,
                    borderColor: colors.primary,
                    color: colors.primary,
                    borderRadius: 1,
                    textTransform: "none",
                    fontSize: "0.9rem",
                    minWidth: "auto",
                    transition: "0.3s",
                    ":hover": {
                      backgroundColor: colors.accent,
                      transform: "scale(1.01)",
                    },
                  }}
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>
                <Button
                  variant="contained"
                  disabled={!product.inStock || !selectedSize || !selectedColor}
                  sx={{
                    flex: 1,
                    background: `linear-gradient(90deg, ${colors.primary} 0%, #ff7043 100%)`,
                    fontWeight: 600,
                    py: 1,
                    borderRadius: 1,
                    textTransform: "none",
                    fontSize: "0.9rem",
                    minWidth: "auto",
                    transition: "0.3s",
                    ":hover": {
                      transform: "scale(1.01)",
                      background: "#a83200",
                    },
                  }}
                >
                  Buy Now
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}
      </Box>
      <Footer />
      
      {/* Enhanced Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            alignItems: 'center',
            fontSize: '0.9rem'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProductDetail;