import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Slider,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Drawer,
  Divider,
  IconButton,
  useMediaQuery,
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
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import colors from "../colors";
import Header from "./Header";
import Footer from "./Footer";
import Wishlist from "./Wishlist";
import { API_BASE_URL } from "../config";

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

const CategoryPage = () => {
  const { categoryName } = useParams();
  const decodedCategory = decodeURIComponent(categoryName);
  const isMobile = useMediaQuery("(max-width:768px)");

  const [productsInCategory, setProductsInCategory] = useState([]);
  const [filters, setFilters] = useState({
    priceRange: [0, 5000],
    newArrivalOnly: false,
    sort: "default",
  });

  const [isFilterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogProduct, setDialogProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);

  const { addToCart = () => {} } = {}; // If you have useCart, import and use it

  useEffect(() => {
    // Fetch products for this category from backend
    fetch(
      `${API_BASE_URL}/products?category=${encodeURIComponent(
        decodedCategory
      )}&limit=1000`
    )
      .then((res) => res.json())
      .then((res) => setProductsInCategory(res.products || []))
      .catch(() => setProductsInCategory([]));
  }, [decodedCategory]);

  const handlePriceChange = (_, newValue) => {
    setFilters((prev) => ({ ...prev, priceRange: newValue }));
  };

  const handleSortChange = (e) => {
    setFilters((prev) => ({ ...prev, sort: e.target.value }));
  };

  const handleCheckboxChange = (e) => {
    setFilters((prev) => ({ ...prev, newArrivalOnly: e.target.checked }));
  };

  const filteredProducts = useMemo(() => {
    let result = productsInCategory.filter(
      (item) =>
        item.price >= filters.priceRange[0] &&
        item.price <= filters.priceRange[1]
    );

    if (filters.newArrivalOnly) {
      result = result.filter((item) => item.isNewArrival);
    }

    switch (filters.sort) {
      case "lowToHigh":
        result.sort((a, b) => a.price - b.price);
        break;
      case "highToLow":
        result.sort((a, b) => b.price - a.price);
        break;
      case "nameAsc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "nameDesc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    return result;
  }, [productsInCategory, filters]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleAddToCartClick = (item) => {
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

  const handleDialogAddToCart = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      window.location.href = "/login";
      return;
    }
    if (dialogProduct && selectedSize && selectedColor) {
      addToCart(dialogProduct, quantity, selectedSize, selectedColor);
      setDialogOpen(false);
    }
  };

  const renderFilters = (
    <Box
      sx={{
        p: 2,
        minWidth: 240,
        bgcolor: colors.drawerBg,
        borderRadius: 2,
        border: `1px solid ${colors.border}`,
      }}
    >
      <Typography
        variant="h6"
        sx={{ mb: 2, fontWeight: 700, color: colors.primary }}
      >
        Filters & Sorting
      </Typography>

      {/* ---- Price Range ---- */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="subtitle2"
          sx={{ mb: 1, color: colors.icon, fontWeight: 500 }}
        >
          Price Range
        </Typography>
        <Slider
          value={filters.priceRange}
          onChange={handlePriceChange}
          valueLabelDisplay="auto"
          min={0}
          max={5000}
          step={100}
          sx={{ color: colors.primary }}
        />
        <Typography variant="caption" sx={{ color: colors.icon }}>
          ₹{filters.priceRange[0]} – ₹{filters.priceRange[1]}
        </Typography>
      </Box>

      <Divider
        sx={{ my: 2, borderBottomWidth: "2px", borderColor: colors.border }}
      />

      {/* ---- New Arrival Only ---- */}
      <FormControlLabel
        control={
          <Checkbox
            checked={filters.newArrivalOnly}
            onChange={handleCheckboxChange}
            size="small"
            sx={{
              color: colors.primary,
              "&.Mui-checked": { color: colors.primary },
            }}
          />
        }
        label="New Arrivals Only"
        sx={{ color: colors.icon }}
      />

      <Divider
        sx={{ my: 2, borderBottomWidth: "2px", borderColor: colors.border }}
      />

      {/* ---- Sort Options ---- */}
      <FormControl component="fieldset">
        <FormLabel
          component="legend"
          sx={{
            fontSize: "0.9rem",
            mb: 1,
            color: colors.icon,
            fontWeight: 500,
          }}
        >
          Sort By
        </FormLabel>
        <RadioGroup value={filters.sort} onChange={handleSortChange}>
          {[
            { value: "default", label: "Default" },
            { value: "lowToHigh", label: "Price: Low to High" },
            { value: "highToLow", label: "Price: High to Low" },
            { value: "nameAsc", label: "Name: A–Z" },
            { value: "nameDesc", label: "Name: Z–A" },
          ].map((option) => (
            <FormControlLabel
              key={option.value}
              value={option.value}
              control={
                <Radio
                  size="small"
                  sx={{
                    color: colors.primary,
                    "&.Mui-checked": { color: colors.primary },
                  }}
                />
              }
              label={option.label}
              sx={{ color: colors.icon }}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </Box>
  );

  return (
    <>
      <Header />
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          py: { xs: 4, md: 6 },
          bgcolor: colors.background,
          minHeight: "100vh",
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 2,
            mb: 2,
          }}
        >
          <AutoAwesomeIcon sx={{ color: colors.primary, fontSize: 24 }} />
          <Typography
            variant="h4"
            sx={{
              color: colors.primary,
              fontWeight: 700,
              background: `linear-gradient(45deg, ${colors.primary}, ${colors.primary}CC)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {decodedCategory}
          </Typography>
          <AutoAwesomeIcon sx={{ color: colors.primary, fontSize: 24 }} />
        </Box>
        <Box
          sx={{
            width: 80,
            height: 3,
            background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
            mx: "auto",
            borderRadius: 2,
            mb: 3,
          }}
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
          }}
        >
          {!isMobile && <Box sx={{ width: 240 }}>{renderFilters}</Box>}

          {isMobile && (
            <>
              <Box sx={{ mb: 3 }}>
                <IconButton
                  onClick={() => setFilterDrawerOpen(true)}
                  sx={{
                    border: `1px solid ${colors.border}`,
                    borderRadius: 1,
                    px: 2,
                    py: 1,
                    color: colors.primary,
                  }}
                >
                  <FilterListIcon sx={{ mr: 1 }} />
                  <Typography variant="body2">Filters</Typography>
                </IconButton>
              </Box>

              <Drawer
                anchor="left"
                open={isFilterDrawerOpen}
                onClose={() => setFilterDrawerOpen(false)}
                PaperProps={{ sx: { bgcolor: colors.drawerBg } }}
              >
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6" sx={{ color: colors.primary }}>
                    Filters
                  </Typography>
                  <IconButton onClick={() => setFilterDrawerOpen(false)}>
                    <CloseIcon />
                  </IconButton>
                </Box>
                <Divider />
                {renderFilters}
              </Drawer>
            </>
          )}

          <Box sx={{ flexGrow: 1 }}>
            {filteredProducts.length === 0 ? (
              // Loading skeleton like ClothingGallery
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
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 3,
                }}
              >
                {filteredProducts.map((item) => (
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
            )}
          </Box>
        </Box>
      </Box>
      {/* Add to Cart Dialog */}
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
            {/* Sizes */}
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
            {/* Colors as circular swatches */}
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
            {/* Quantity */}
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
        {/* Actions */}
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

export default CategoryPage;
