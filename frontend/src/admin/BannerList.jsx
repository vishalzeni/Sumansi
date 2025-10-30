// filename: BannerList.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormControlLabel,
  IconButton,
  CircularProgress,
  Card,
  CardMedia,
  Grid,
  Tooltip,
  TextField,
  Snackbar,
  Alert,
  Skeleton,
} from "@mui/material";
import {
  Add,
  Delete,
  Edit,
  Visibility,
  VisibilityOff,
  ArrowBackIos,
  ArrowForwardIos,
  CloudUpload,
} from "@mui/icons-material";
import colors from "../colors"; // Your custom color palette
import { API_BASE_URL, ADMIN_API_KEY } from "../config";

const BannerList = () => {
  const [banners, setBanners] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    image: "",
    isActive: true,
    order: 0,
  });
  const [bannersFetched, setBannersFetched] = useState(false);
  const [error, setError] = useState(null);

  const API_KEY = ADMIN_API_KEY; // Your provided API key

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/banner/banners`, {
        headers: { "x-api-key": API_KEY },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch banners: ${res.statusText}`);
      }
      const data = await res.json();
      setBanners(data);
      setBannersFetched(true);
    } catch (err) {
      setError("Failed to fetch banners. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners(); // Fetch banners on mount
  }, []);

  // Auto-slide for active banners
  useEffect(() => {
    const active = banners.filter((b) => b.isActive);
    if (active.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % active.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  const handleImageUpload = async (file) => {
    if (!file) return;
    // Validate file
    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image (JPEG, PNG, or GIF).");
      return;
    }
    if (file.size > maxSize) {
      setError("Image size must be less than 5MB.");
      return;
    }

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append("image", file);

    try {
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        headers: { "x-api-key": API_KEY },
        body: uploadData,
      });
      const json = await res.json();
      if (res.ok) {
        setFormData((prev) => ({ ...prev, image: json.url }));
      } else {
        setError(json.error || "Failed to upload image.");
      }
    } catch (err) {
      setError("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.order < 0) {
      setError("Order must be a non-negative number.");
      return;
    }
    setLoading(true);
    const method = editingBanner ? "PUT" : "POST";
    const url = editingBanner
      ? `${API_BASE_URL}/banner/admin/update/${editingBanner._id}`
      : `${API_BASE_URL}/banner/admin/create`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (res.ok) {
        fetchBanners();
        setShowForm(false);
        setEditingBanner(null);
        setFormData({ image: "", isActive: true, order: 0 });
      } else {
        setError(json.error || "Failed to save banner.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      image: "",
      isActive: true,
      order: 0,
    });
    setEditingBanner(null);
    setShowForm(false);
  };

  const toggleStatus = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/banner/admin/toggle/${id}`, {
        method: "PATCH",
        headers: { "x-api-key": API_KEY },
      });
      if (res.ok) {
        fetchBanners();
      } else {
        throw new Error("Failed to toggle status");
      }
    } catch (err) {
      setError("Failed to toggle status. Please try again.");
      console.error(err);
    }
  };

  const deleteBanner = async (id) => {
    if (!window.confirm("Delete this banner?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/banner/admin/delete/${id}`, {
        method: "DELETE",
        headers: { "x-api-key": API_KEY },
      });
      if (res.ok) {
        fetchBanners();
      } else {
        throw new Error("Failed to delete banner");
      }
    } catch (err) {
      setError("Failed to delete banner. Please try again.");
    }
  };

  return (
    <Box sx={{ p: 4, backgroundColor: colors.background }}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Banner Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setShowForm(true)}
          sx={{ bgcolor: colors.primary }}
        >
          Add Banner
        </Button>
      </Box>

      {/* Loading State */}
      {loading && !bannersFetched && (
        <Box textAlign="center" py={5}>
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3, mb: 2 }} />
          <CircularProgress />
          <Typography>Loading banners...</Typography>
        </Box>
      )}

      {/* No Banners Message */}
      {bannersFetched && banners.length === 0 && (
        <Box textAlign="center" py={5}>
          <Typography variant="h6" color="textSecondary">
            No banners found. Add a banner to get started!
          </Typography>
        </Box>
      )}

      {/* Slider */}
      {bannersFetched && banners.filter((b) => b.isActive).length > 0 && (
        <Box position="relative" height={300} mb={5}>
          {banners
            .filter((b) => b.isActive)
            .map((banner, i) => (
              <Card
                key={banner._id}
                sx={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  opacity: i === currentSlide ? 1 : 0,
                  transition: "opacity 0.5s ease",
                  backgroundColor: colors.cardBg,
                }}
              >
                <CardMedia
                  component="img"
                  image={banner.image}
                  alt="Banner"
                  sx={{ height: "100%", objectFit: "cover" }}
                />
              </Card>
            ))}
          <IconButton
            onClick={() =>
              setCurrentSlide(
                (prev) =>
                  (prev - 1 + banners.filter((b) => b.isActive).length) %
                  banners.filter((b) => b.isActive).length
              )
            }
            sx={{ position: "absolute", top: "50%", left: 10, color: "white" }}
          >
            <ArrowBackIos fontSize="small" />
          </IconButton>
          <IconButton
            onClick={() =>
              setCurrentSlide(
                (prev) => (prev + 1) % banners.filter((b) => b.isActive).length
              )
            }
            sx={{ position: "absolute", top: "50%", right: 10, color: "white" }}
          >
            <ArrowForwardIos fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* Banner List */}
      {bannersFetched && banners.length > 0 && (
        <Grid container spacing={2}>
          {banners.map((banner) => (
            <Grid item xs={12} md={6} lg={4} key={banner._id}>
              <Card sx={{ backgroundColor: colors.cardBg }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={banner.image}
                  alt="Banner"
                />
                <Box mt={2} display="flex" gap={1} p={2}>
                  <Tooltip title="Toggle Status">
                    <IconButton onClick={() => toggleStatus(banner._id)}>
                      {banner.isActive ? (
                        <Visibility sx={{ color: "green" }} />
                      ) : (
                        <VisibilityOff />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton
                      onClick={() => {
                        setEditingBanner(banner);
                        setFormData({ ...banner });
                        setShowForm(true);
                      }}
                    >
                      <Edit color="primary" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => deleteBanner(banner._id)}>
                      <Delete color="error" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Banner Form Dialog */}
      <Dialog open={showForm} onClose={resetForm} maxWidth="sm" fullWidth>
        <DialogTitle>{editingBanner ? "Edit Banner" : "Add Banner"}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                />
              }
              label="Active"
            />
            <TextField
              fullWidth
              type="number"
              label="Order"
              value={formData.order}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  order: parseInt(e.target.value, 10) || 0,
                })
              }
              margin="normal"
              inputProps={{ min: 0 }}
            />
            <Box mt={2}>
              {formData.image ? (
                <Box>
                  <img
                    src={formData.image}
                    alt="Preview"
                    style={{ maxWidth: "100%", borderRadius: 8 }}
                  />
                  <Button
                    color="error"
                    onClick={() => setFormData({ ...formData, image: "" })}
                  >
                    Remove Image
                  </Button>
                </Box>
              ) : (
                <Button component="label" startIcon={<CloudUpload />} variant="outlined">
                  {uploading ? <CircularProgress size={20} /> : "Upload Image"}
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/gif"
                    onChange={(e) => handleImageUpload(e.target.files[0])}
                  />
                </Button>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetForm}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || uploading || !formData.image}
            variant="contained"
            sx={{ bgcolor: colors.primary }}
          >
            {loading ? "Saving..." : editingBanner ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BannerList;