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
import colors from "../colors";
import { API_BASE_URL, ADMIN_API_KEY } from "../config";

/* --------------------------------------------------------------- */
/*  Fixed dimensions & WebP quality                               */
/* --------------------------------------------------------------- */
const FIXED_WIDTH = 1600;      // change if you need another width
const FIXED_HEIGHT = 600;      // change if you need another height
const WEBP_QUALITY = 80;       // 0-100 (80 = good quality + compression)

/* --------------------------------------------------------------- */
/*  Convert file → WebP (fixed size) → Base64 data URL            */
/* --------------------------------------------------------------- */
const convertToWebPBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = FIXED_WIDTH;
        canvas.height = FIXED_HEIGHT;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, FIXED_WIDTH, FIXED_HEIGHT);

        canvas.toBlob(
          (blob) => {
            const fr = new FileReader();
            fr.onload = () => resolve(fr.result); // data:image/webp;base64,...
            fr.onerror = reject;
            fr.readAsDataURL(blob);
          },
          "image/webp",
          WEBP_QUALITY / 100
        );
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

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

  const API_KEY = ADMIN_API_KEY;

  /* ----------------------- FETCH BANNERS ----------------------- */
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/banner/banners`, {
        headers: { "x-api-key": API_KEY },
      });
      if (!res.ok) throw new Error(`Failed: ${res.statusText}`);
      const data = await res.json();
      setBanners(data);
      setBannersFetched(true);
    } catch (err) {
      setError("Failed to fetch banners.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  /* ----------------------- AUTO SLIDE ----------------------- */
  useEffect(() => {
    const active = banners.filter((b) => b.isActive);
    if (active.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % active.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  /* ----------------------- IMAGE PROCESS & UPLOAD ----------------------- */
  const handleImageUpload = async (file) => {
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5 MB

    if (!validTypes.includes(file.type)) {
      setError("Only JPEG, PNG or GIF allowed.");
      return;
    }
    if (file.size > maxSize) {
      setError("Image must be < 5 MB.");
      return;
    }

    setUploading(true);
    try {
      const base64 = await convertToWebPBase64(file);
      setFormData((prev) => ({ ...prev, image: base64 }));
    } catch (err) {
      console.error(err);
      setError("Failed to process image.");
    } finally {
      setUploading(false);
    }
  };

  /* ----------------------- FORM SUBMIT ----------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.order < 0) {
      setError("Order must be >= 0.");
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
        resetForm();
      } else {
        setError(json.error || "Failed to save banner.");
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ image: "", isActive: true, order: 0 });
    setEditingBanner(null);
    setShowForm(false);
  };

  /* ----------------------- TOGGLE / DELETE ----------------------- */
  const toggleStatus = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/banner/admin/toggle/${id}`, {
        method: "PATCH",
        headers: { "x-api-key": API_KEY },
      });
      if (res.ok) fetchBanners();
      else throw new Error();
    } catch {
      setError("Failed to toggle status.");
    }
  };

  const deleteBanner = async (id) => {
    if (!window.confirm("Delete this banner?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/banner/admin/delete/${id}`, {
        method: "DELETE",
        headers: { "x-api-key": API_KEY },
      });
      if (res.ok) fetchBanners();
      else throw new Error();
    } catch {
      setError("Failed to delete banner.");
    }
  };

  /* ----------------------- UI ----------------------- */
  return (
    <Box sx={{ p: 4, backgroundColor: colors.background }}>
      {/* Header */}
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

      {/* Loading */}
      {loading && !bannersFetched && (
        <Box textAlign="center" py={5}>
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3, mb: 2 }} />
          <CircularProgress />
          <Typography>Loading banners...</Typography>
        </Box>
      )}

      {/* No banners */}
      {bannersFetched && banners.length === 0 && (
        <Box textAlign="center" py={5}>
          <Typography variant="h6" color="textSecondary">
            No banners found. Add one to start!
          </Typography>
        </Box>
      )}

      {/* Slider (active banners) */}
      {bannersFetched && banners.filter((b) => b.isActive).length > 0 && (
        <Box position="relative" height={300} mb={5} overflow="hidden">
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

      {/* Banner Grid */}
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

      {/* Form Dialog */}
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

            {/* Image preview / upload */}
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