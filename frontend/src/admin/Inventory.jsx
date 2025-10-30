import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  FormControlLabel,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  Chip,
  Grid,
  IconButton,
  Pagination,
  Tooltip,
  useMediaQuery,
  useTheme,
  Skeleton,
  Checkbox,
  Paper,
  TextField,
  InputAdornment,
  Stack,
  Avatar,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  NewReleases,
  Add as AddIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import colors from "../colors";
import { API_BASE_URL } from "../config";

const Inventory = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editProduct, setEditProduct] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [uploading, setUploading] = useState({ main: false, additional: false });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [colorInput, setColorInput] = useState("");

  const itemsPerPage = 10;

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    setProductsError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/products?page=${page}&limit=${itemsPerPage}`,
        { credentials: "include" }
      );
      const data = await response.json();
      if (response.ok) {
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
      } else {
        setProductsError(data.error || "Failed to fetch products.");
        setProducts([]);
      }
    } catch (err) {
      setProductsError("Failed to fetch products.");
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, [page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const fetchProductDetails = async (productId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const product = await response.json();
        return product;
      }
      return null;
    } catch (err) {
      console.error("Failed to fetch product details:", err);
      return null;
    }
  };

  const handleEditProduct = async (product) => {
    setActionLoading(true);
    try {
      const productDetails = await fetchProductDetails(product._id);
      if (productDetails) {
        setEditProduct({
          ...productDetails,
          sizes: Array.isArray(productDetails.sizes)
            ? productDetails.sizes.join(", ")
            : "",
          colors: Array.isArray(productDetails.colors)
            ? productDetails.colors
            : [],
        });
        setColorInput(
          Array.isArray(productDetails.colors)
            ? productDetails.colors.join(", ")
            : ""
        );
        setFormErrors({});
        setEditDialogOpen(true);
      } else {
        setSnackbar({
          open: true,
          message: "Failed to load product details.",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Failed to load product details.",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!editProduct?.name) errors.name = "Name is required";
    if (!editProduct?.price || editProduct.price <= 0)
      errors.price = "Valid price is required";
    if (!editProduct?.marketPrice || editProduct.marketPrice <= 0)
      errors.marketPrice = "Valid market price is required";
    if (!editProduct?.category) errors.category = "Category is required";
    if (!editProduct?.image) errors.image = "Main image is required";
    if (!editProduct?.colors || editProduct.colors.length === 0)
      errors.colors = "At least one color is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateProduct = async () => {
    if (!validateForm()) return;
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/${editProduct._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editProduct.name,
          price: editProduct.price,
          marketPrice: editProduct.marketPrice,
          category: editProduct.category,
          description: editProduct.description,
          sizes: editProduct.sizes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          colors: editProduct.colors,
          inStock: editProduct.inStock,
          isNewArrival: editProduct.isNewArrival,
          image: editProduct.image,
          images: editProduct.images || [],
        }),
        credentials: "include",
      });
      if (response.ok) {
        setEditDialogOpen(false);
        setEditProduct(null);
        setColorInput("");
        setSnackbar({
          open: true,
          message: "Product updated successfully!",
          severity: "success",
        });
        fetchProducts();
      } else {
        const errorData = await response.json();
        setSnackbar({
          open: true,
          message: errorData.error || "Failed to update product.",
          severity: "error",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Failed to update product.",
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setActionLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (response.ok) {
          setSnackbar({
            open: true,
            message: "Product deleted.",
            severity: "success",
          });
          fetchProducts();
        } else {
          setSnackbar({
            open: true,
            message: "Failed to delete product.",
            severity: "error",
          });
        }
      } catch (err) {
        setSnackbar({
          open: true,
          message: "Failed to delete product.",
          severity: "error",
        });
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleImageUpload = async (e, type = "additional") => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading((prev) => ({ ...prev, [type]: true }));
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        if (type === "main") {
          setEditProduct({ ...editProduct, image: data.url });
        } else {
          const updatedImages = [...(editProduct.images || []), data.url];
          setEditProduct({ ...editProduct, images: updatedImages });
        }
        setSnackbar({
          open: true,
          message: "Image uploaded successfully!",
          severity: "success",
        });
      } else {
        throw new Error("Image upload failed");
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Image upload failed.",
        severity: "error",
      });
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
      e.target.value = null;
    }
  };

  const handleReplaceImage = async (index) => {
    setSelectedImageIndex(index);
    document.getElementById("replace-image-input").click();
  };

  const handleReplaceImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || selectedImageIndex === null) return;

    setUploading((prev) => ({ ...prev, additional: true }));
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        const updatedImages = [...(editProduct.images || [])];
        updatedImages[selectedImageIndex] = data.url;
        setEditProduct({ ...editProduct, images: updatedImages });
        setSnackbar({
          open: true,
          message: "Image replaced successfully!",
          severity: "success",
        });
      } else {
        throw new Error("Image replace failed");
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Image replace failed.",
        severity: "error",
      });
    } finally {
      setUploading((prev) => ({ ...prev, additional: false }));
      setSelectedImageIndex(null);
      e.target.value = null;
    }
  };

  const handleRemoveImage = (index) => {
    const updatedImages = [...(editProduct.images || [])];
    updatedImages.splice(index, 1);
    setEditProduct({
      ...editProduct,
      images: updatedImages,
      image: updatedImages[0] || editProduct.image,
    });
  };

  const handleRemoveColor = (color) => {
    const updatedColors = editProduct.colors.filter((c) => c !== color);
    setEditProduct({ ...editProduct, colors: updatedColors });
    setColorInput(updatedColors.join(", "));
  };

  const handleColorInputChange = (e) => {
    const value = e.target.value;
    setColorInput(value);
    const newColors = value
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    setEditProduct({ ...editProduct, colors: newColors });
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 4, bgcolor: colors.background, minHeight: "100vh" }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            background: snackbar.severity === "success" ? colors.badge : colors.error,
            color: colors.badgeText,
            fontWeight: 600,
            fontSize: "1rem",
            borderRadius: 2,
            boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
          }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>

      {actionLoading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            bgcolor: "rgba(0,0,0,0.5)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress sx={{ color: colors.primary }} size={60} />
        </Box>
      )}

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: colors.cardBg,
              textAlign: "left",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              transition: "transform 0.2s",
              "&:hover": { transform: "scale(1.02)" },
            }}
          >
            <Typography variant="h4" fontWeight="700" color={colors.primary}>
              {products.length}
            </Typography>
            <Typography variant="body2" color={colors.text}>
              Total Products
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: colors.cardBg,
              textAlign: "left",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              transition: "transform 0.2s",
              "&:hover": { transform: "scale(1.02)" },
            }}
          >
            <Typography variant="h4" fontWeight="700" color={colors.primary}>
              {new Set(products.map((p) => p.category)).size}
            </Typography>
            <Typography variant="body2" color={colors.text}>
              Categories
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: colors.cardBg,
              textAlign: "left",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              transition: "transform 0.2s",
              "&:hover": { transform: "scale(1.02)" },
            }}
          >
            <Typography variant="h4" fontWeight="700" color={colors.primary}>
              {products.filter((p) => p.inStock).length}
            </Typography>
            <Typography variant="body2" color={colors.text}>
              In Stock
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: colors.cardBg,
              textAlign: "left",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              transition: "transform 0.2s",
              "&:hover": { transform: "scale(1.02)" },
            }}
          >
            <Typography variant="h4" fontWeight="700" color={colors.primary}>
              {products.filter((p) => p.isNewArrival).length}
            </Typography>
            <Typography variant="body2" color={colors.text}>
              New Arrivals
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {loadingProducts ? (
        <Box display="flex" flexDirection="column" gap={2} my={4}>
          {[...Array(itemsPerPage)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={120}
              sx={{ borderRadius: 2, bgcolor: colors.accent }}
            />
          ))}
        </Box>
      ) : productsError ? (
        <Paper
          sx={{
            p: 3,
            bgcolor: colors.error,
            color: colors.badgeText,
            borderRadius: 3,
            textAlign: "left",
          }}
        >
          <Typography>{productsError}</Typography>
        </Paper>
      ) : products.length === 0 ? (
        <Paper
          sx={{
            p: 3,
            textAlign: "left",
            borderRadius: 3,
            bgcolor: colors.cardBg,
            border: `1px solid ${colors.border}`,
          }}
        >
          <Typography variant="h6" color={colors.text}>
            No products found
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {products.map((item) => (
            <Card
              key={item._id}
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                borderRadius: 2,
                bgcolor: colors.cardBg,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                border: `1px solid ${colors.border}`,
                "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.1)" },
              }}
            >
              <Box sx={{ flex: 1, p: 3, textAlign: "left" }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Typography variant="h6" fontWeight={600} color={colors.text}>
                    {item.name}
                  </Typography>
                  {item.isNewArrival && (
                    <Chip
                      label="New"
                      size="small"
                      sx={{
                        ml: 1,
                        bgcolor: colors.primary,
                        color: colors.badgeText,
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Box>
                <Typography variant="body2" color={colors.text} sx={{ mb: 2 }}>
                  {item.category}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Chip
                    label={`Price: ₹${item.price}`}
                    size="small"
                    sx={{
                      bgcolor: colors.badge,
                      color: colors.badgeText,
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    label={`MRP: ₹${item.marketPrice}`}
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: colors.border,
                      color: colors.text,
                      textDecoration: "line-through",
                    }}
                  />
                  <Chip
                    label={item.inStock ? "In Stock" : "Out of Stock"}
                    size="small"
                    sx={{
                      bgcolor: item.inStock ? colors.badge : colors.error,
                      color: colors.badgeText,
                    }}
                  />
                </Stack>
                {item.description && (
                  <Typography
                    variant="body2"
                    color={colors.text}
                    sx={{
                      mb: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      textAlign: "left",
                    }}
                  >
                    {item.description}
                  </Typography>
                )}
                <Stack direction="column" spacing={1} sx={{ mb: 2 }}>
                  {Array.isArray(item.sizes) && item.sizes.length > 0 && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Typography variant="caption" color={colors.text} fontWeight="500">
                        Sizes:
                      </Typography>
                      {item.sizes.map((size, idx) => (
                        <Chip
                          key={idx}
                          label={size}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: colors.border,
                            color: colors.text,
                          }}
                        />
                      ))}
                    </Box>
                  )}
                  {Array.isArray(item.colors) && item.colors.length > 0 && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Typography variant="caption" color={colors.text} fontWeight="500">
                        Colors:
                      </Typography>
                      {item.colors.map((color, idx) => (
                        <Chip
                          key={idx}
                          label={color}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: colors.border,
                            color: colors.text,
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Stack>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "row", sm: "column" },
                  justifyContent: "center",
                  alignItems: "center",
                  p: 2,
                  gap: 1,
                  bgcolor: colors.drawerBg,
                  borderLeft: { sm: `1px solid ${colors.border}` },
                  borderTop: { xs: `1px solid ${colors.border}`, sm: "none" },
                }}
              >
                <Tooltip title="Edit">
                  <IconButton
                    onClick={() => handleEditProduct(item)}
                    size="medium"
                    sx={{ color: colors.primary }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    onClick={() => handleDeleteProduct(item._id)}
                    size="medium"
                    sx={{ color: colors.error }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: isMobile ? 0 : 3,
            bgcolor: colors.cardBg,
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            border: `1px solid ${colors.border}`,
          },
        }}
      >
        <DialogTitle sx={{ bgcolor: colors.primary, color: colors.badgeText, py: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <EditIcon sx={{ mr: 1.5 }} />
              <Typography variant="h6" fontWeight={600}>
                Edit Product
              </Typography>
            </Box>
            <IconButton
              onClick={() => setEditDialogOpen(false)}
              sx={{ color: colors.badgeText }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: isMobile ? 2 : 3, textAlign: "left" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="h6" fontWeight={600} color={colors.text}>
              Product Details
            </Typography>
            <TextField
              label="Product Name"
              value={editProduct?.name || ""}
              onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
              fullWidth
              variant="outlined"
              error={!!formErrors.name}
              helperText={formErrors.name}
              sx={{
                "& .MuiInputLabel-root": { color: colors.text },
                "& .MuiOutlinedInput-root": {
                  bgcolor: colors.accent,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.primary,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.primary,
                  },
                },
              }}
            />
            <TextField
              label="Price"
              type="number"
              value={editProduct?.price || ""}
              onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
              fullWidth
              variant="outlined"
              error={!!formErrors.price}
              helperText={formErrors.price}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              sx={{
                "& .MuiInputLabel-root": { color: colors.text },
                "& .MuiOutlinedInput-root": {
                  bgcolor: colors.accent,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.primary,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.primary,
                  },
                },
              }}
            />
            <TextField
              label="Market Price"
              type="number"
              value={editProduct?.marketPrice || ""}
              onChange={(e) => setEditProduct({ ...editProduct, marketPrice: e.target.value })}
              fullWidth
              variant="outlined"
              error={!!formErrors.marketPrice}
              helperText={formErrors.marketPrice}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
              sx={{
                "& .MuiInputLabel-root": { color: colors.text },
                "& .MuiOutlinedInput-root": {
                  bgcolor: colors.accent,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.primary,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.primary,
                  },
                },
              }}
            />
            <TextField
              label="Category"
              value={editProduct?.category || ""}
              onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
              fullWidth
              variant="outlined"
              error={!!formErrors.category}
              helperText={formErrors.category}
              sx={{
                "& .MuiInputLabel-root": { color: colors.text },
                "& .MuiOutlinedInput-root": {
                  bgcolor: colors.accent,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.primary,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.primary,
                  },
                },
              }}
            />
            <TextField
              label="Sizes (comma-separated)"
              value={editProduct?.sizes || ""}
              onChange={(e) => setEditProduct({ ...editProduct, sizes: e.target.value })}
              fullWidth
              variant="outlined"
              helperText="e.g., S, M, L"
              sx={{
                "& .MuiInputLabel-root": { color: colors.text },
                "& .MuiOutlinedInput-root": {
                  bgcolor: colors.accent,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.primary,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.primary,
                  },
                },
              }}
            />
            <Box>
              <TextField
                label="Colors (comma-separated)"
                value={colorInput}
                onChange={handleColorInputChange}
                fullWidth
                variant="outlined"
                helperText="e.g., Red, Blue, Green"
                error={!!formErrors.colors}
                sx={{
                  "& .MuiInputLabel-root": { color: colors.text },
                  "& .MuiOutlinedInput-root": {
                    bgcolor: colors.accent,
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.primary,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: colors.primary,
                    },
                  },
                }}
              />
              {editProduct?.colors && editProduct.colors.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                  {editProduct.colors.map((color, idx) => (
                    <Chip
                      key={idx}
                      label={color}
                      onDelete={() => handleRemoveColor(color)}
                      sx={{
                        bgcolor: colors.accent,
                        color: colors.text,
                        "& .MuiChip-deleteIcon": { color: colors.error },
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
            <TextField
              label="Description"
              value={editProduct?.description || ""}
              onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              sx={{
                "& .MuiInputLabel-root": { color: colors.text },
                "& .MuiOutlinedInput-root": {
                  bgcolor: colors.accent,
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.primary,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.primary,
                  },
                },
              }}
            />
            <Box>
              <Typography variant="subtitle1" fontWeight={600} color={colors.text} sx={{ mb: 1 }}>
                Images
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color={colors.text} sx={{ mb: 1 }}>
                  Main Image
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  {editProduct?.image ? (
                    <Box sx={{ position: "relative" }}>
                      <Avatar
                        src={editProduct.image}
                        variant="square"
                        sx={{ width: 100, height: 100, borderRadius: 2, border: `1px solid ${colors.border}` }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => setEditProduct({ ...editProduct, image: "" })}
                        sx={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          bgcolor: colors.error,
                          color: colors.badgeText,
                          "&:hover": { bgcolor: colors.error },
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: 100,
                        height: 100,
                        border: `2px dashed ${colors.border}`,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: colors.accent,
                      }}
                    >
                      <Typography variant="caption" color={colors.text}>
                        No Image
                      </Typography>
                    </Box>
                  )}
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadIcon />}
                    disabled={uploading.main}
                    sx={{
                      textTransform: "none",
                      borderColor: colors.primary,
                      color: colors.primary,
                      "&:hover": { borderColor: colors.primary, bgcolor: colors.accent },
                    }}
                  >
                    {uploading.main ? "Uploading..." : "Upload Main Image"}
                    <input
                      type="file"
                      hidden
                      onChange={(e) => handleImageUpload(e, "main")}
                      accept="image/*"
                    />
                  </Button>
                </Box>
                {formErrors.image && (
                  <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                    {formErrors.image}
                  </Typography>
                )}
              </Box>
              <Box>
                <Typography variant="subtitle2" color={colors.text} sx={{ mb: 1 }}>
                  Additional Images
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AddIcon />}
                  disabled={uploading.additional}
                  sx={{
                    mb: 2,
                    textTransform: "none",
                    borderColor: colors.primary,
                    color: colors.primary,
                    "&:hover": { borderColor: colors.primary, bgcolor: colors.accent },
                  }}
                >
                  {uploading.additional ? "Uploading..." : "Add Images"}
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={(e) => handleImageUpload(e, "additional")}
                    accept="image/*"
                  />
                </Button>
                <input
                  type="file"
                  hidden
                  id="replace-image-input"
                  onChange={handleReplaceImageUpload}
                  accept="image/*"
                />
                {editProduct?.images && editProduct.images.length > 0 && (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                    {editProduct.images.map((img, index) => (
                      <Box key={index} sx={{ position: "relative" }}>
                        <Avatar
                          src={img}
                          variant="square"
                          sx={{
                            width: 100,
                            height: 100,
                            borderRadius: 2,
                            border: `1px solid ${colors.border}`,
                            cursor: "pointer",
                            "&:hover": { opacity: 0.8 },
                          }}
                          onClick={() => handleReplaceImage(index)}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveImage(index)}
                          sx={{
                            position: "absolute",
                            top: -8,
                            right: -8,
                            bgcolor: colors.error,
                            color: colors.badgeText,
                            "&:hover": { bgcolor: colors.error },
                          }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!editProduct?.inStock}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, inStock: e.target.checked })
                    }
                    sx={{ color: colors.primary, "&.Mui-checked": { color: colors.primary } }}
                  />
                }
                label="In Stock"
                sx={{ color: colors.text }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!editProduct?.isNewArrival}
                    onChange={(e) =>
                      setEditProduct({ ...editProduct, isNewArrival: e.target.checked })
                    }
                    sx={{ color: colors.primary, "&.Mui-checked": { color: colors.primary } }}
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <NewReleases sx={{ mr: 0.5, color: colors.primary }} />
                    New Arrival
                  </Box>
                }
                sx={{ color: colors.text }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 3, bgcolor: colors.accent }}>
          <Button
            onClick={() => setEditDialogOpen(false)}
            disabled={actionLoading}
            sx={{
              textTransform: "none",
              color: colors.text,
              "&:hover": { bgcolor: colors.border },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateProduct}
            disabled={uploading.main || uploading.additional || actionLoading}
            variant="contained"
            sx={{
              textTransform: "none",
              bgcolor: colors.primary,
              color: colors.badgeText,
              "&:hover": { bgcolor: colors.primary, opacity: 0.9 },
              px: 3,
            }}
            startIcon={actionLoading ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {actionLoading ? "Updating..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            showFirstButton
            showLastButton
            size={isMobile ? "small" : "medium"}
            sx={{
              "& .MuiPaginationItem-root": {
                color: colors.text,
                "&.Mui-selected": {
                  bgcolor: colors.primary,
                  color: colors.badgeText,
                  "&:hover": { bgcolor: colors.primary },
                },
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default Inventory;