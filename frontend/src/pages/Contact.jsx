// Contact.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Stack,
  IconButton,
  Alert,
  Card,
  CardContent,
  Paper,
  Chip,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import colors from "../colors";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { API_BASE_URL } from "../config";

// Icons
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.1 } },
};

const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const validate = () => {
    const e = {};
    if (!formData.fullName.trim()) e.fullName = "Full name is required";
    if (!formData.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = "Invalid email address";
    if (!formData.phone.trim()) e.phone = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) e.phone = "Enter a valid 10-digit number";
    if (!formData.message.trim()) e.message = "Message is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setSubmission(null);
    setErrors({});

    try {
      const res = await fetch(`${API_BASE_URL}/email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setSubmission({ type: "success", msg: "Your message has been sent successfully!" });
        setFormData({ fullName: "", phone: "", email: "", message: "" });
      } else {
        throw new Error(data.message ?? "Something went wrong");
      }
    } catch (err) {
      setSubmission({ type: "error", msg: err.message ?? "Failed to send message. Please try again." });
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Header />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={submission?.type} sx={{ width: "100%" }}>
          {submission?.msg}
        </Alert>
      </Snackbar>

      <Box
        sx={{
          backgroundColor: colors.background,
          py: { xs: 4, md: 8 },
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            right: 0,
            width: "40%",
            height: "100%",
            background: `linear-gradient(135deg, ${colors.primary}15, transparent)`,
            zIndex: 0,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            {/* Hero */}
            <Box sx={{ textAlign: "center", mb: { xs: 6, md: 8 }, maxWidth: 800, mx: "auto" }}>
              <Chip
                label="Contact Us"
                icon={<ContactMailIcon sx={{ fontSize: "1.2rem", color: "white" }} />}
                sx={{
                  mb: 3,
                  px: 2,
                  py: 1,
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  backgroundColor: colors.primary,
                  color: "white",
                }}
              />
              <Typography
                variant="h1"
                component={motion.h1}
                variants={slideUp}
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "2.5rem", md: "3.5rem" },
                  mb: 3,
                  color: colors.primary,
                  lineHeight: 1.2,
                }}
              >
                Let's Connect
              </Typography>
              <Typography
                variant="h6"
                component={motion.p}
                variants={slideUp}
                sx={{ color: colors.textSecondary, fontSize: { xs: "1rem", md: "1.25rem" }, lineHeight: 1.6 }}
              >
                We're here to help and answer any questions you might have. Reach out to us and we'll respond as soon as possible.
              </Typography>
            </Box>

            {/* Contact Cards */}
            <Grid container spacing={4} justifyContent="center" sx={{ mb: { xs: 6, md: 8 } }}>
              <Grid item xs={12} sm={6} md={4}>
                <motion.div variants={slideUp}>
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      boxShadow: `0 8px 24px ${colors.primary}10`,
                      transition: "all .3s ease",
                      "&:hover": { transform: "translateY(-5px)", boxShadow: `0 12px 28px ${colors.primary}20` },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: "center" }}>
                      <Box
                        sx={{
                          width: 72,
                          height: 72,
                          borderRadius: "50%",
                          bgcolor: `${colors.primary}20`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 3,
                          mx: "auto",
                          color: colors.primary,
                        }}
                      >
                        <PhoneIcon sx={{ fontSize: 32 }} />
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                        Call Us
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 3, color: colors.textSecondary }}>
                        Available Monday to Friday from 9AM to 6PM
                      </Typography>
                      <Button
                        variant="contained"
                        href="tel:+919315036994"
                        startIcon={<PhoneIcon />}
                        sx={{
                          px: 3,
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          backgroundColor: colors.primary,
                        }}
                      >
                        +91 93150 36994
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <motion.div variants={slideUp} transition={{ delay: 0.1 }}>
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      boxShadow: `0 8px 24px ${colors.primary}10`,
                      transition: "all .3s ease",
                      "&:hover": { transform: "translateY(-5px)", boxShadow: `0 12px 28px ${colors.primary}20` },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 3, md: 4 }, textAlign: "center" }}>
                      <Box
                        sx={{
                          width: 72,
                          height: 72,
                          borderRadius: "50%",
                          bgcolor: `${colors.primary}20`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 3,
                          mx: "auto",
                          color: colors.primary,
                        }}
                      >
                        <EmailIcon sx={{ fontSize: 32 }} />
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                        Email Us
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 3, color: colors.textSecondary }}>
                        We typically respond within 24 hours
                      </Typography>
                      <Button
                        variant="contained"
                        href="mailto:siyat211@gmail.com"
                        startIcon={<EmailIcon />}
                        sx={{
                          px: 3,
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          backgroundColor: colors.primary,
                          textTransform: "lowercase",
                        }}
                      >
                        siyat211@gmail.com
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>

            {/* Form */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                p: { xs: 3, md: 6 },
                mb: { xs: 6, md: 8 },
                backgroundColor: colors.cardBg,
                boxShadow: `0 8px 32px ${colors.primary}10`,
              }}
            >
              <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 }, maxWidth: 600, mx: "auto" }}>
                <Chip
                  label="Send Us a Message"
                  icon={<ContactSupportIcon color={colors.primary} />}
                  sx={{
                    mb: 3,
                    px: 2,
                    py: 1,
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    backgroundColor: colors.primary,
                    color: "white",
                  }}
                />
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                  Have a Question?
                </Typography>
                <Typography variant="body1" sx={{ color: colors.textSecondary }}>
                  Fill out the form below and our team will get back to you shortly.
                </Typography>
              </Box>

              <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                autoComplete="off"
                sx={{
                  backgroundColor: "#fff",
                  p: { xs: 4, sm: 6 },
                  borderRadius: 4,
                  boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
                  maxWidth: 600,
                  mx: "auto",
                  position: "relative",
                }}
              >
                {loading && (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      bgcolor: "rgba(255,255,255,0.8)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 10,
                      borderRadius: 4,
                    }}
                  >
                    <CircularProgress sx={{ color: colors.primary, mb: 2 }} />
                    <Typography variant="body2" color="textSecondary">
                      Sending message...
                    </Typography>
                  </Box>
                )}

                <Stack spacing={4}>
                  <TextField
                    label="Full Name"
                    value={formData.fullName}
                    onChange={handleChange("fullName")}
                    error={!!errors.fullName}
                    helperText={errors.fullName}
                    required
                    fullWidth
                    variant="outlined"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                    disabled={loading}
                  />
                  <TextField
                    label="Phone Number"
                    value={formData.phone}
                    onChange={handleChange("phone")}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    required
                    type="tel"
                    fullWidth
                    variant="outlined"
                    inputProps={{ maxLength: 10, inputMode: "numeric", pattern: "[0-9]*" }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                    disabled={loading}
                  />
                  <TextField
                    label="Email Address"
                    value={formData.email}
                    onChange={handleChange("email")}
                    error={!!errors.email}
                    helperText={errors.email}
                    required
                    type="email"
                    fullWidth
                    variant="outlined"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                    disabled={loading}
                  />
                  <TextField
                    label="Your Message"
                    value={formData.message}
                    onChange={handleChange("message")}
                    error={!!errors.message}
                    helperText={errors.message}
                    required
                    multiline
                    rows={5}
                    fullWidth
                    variant="outlined"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
                    disabled={loading}
                  />
                  <Box textAlign="center">
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      sx={{
                        px: 6,
                        py: 1.5,
                        fontWeight: 600,
                        fontSize: "1rem",
                        borderRadius: 8,
                        backgroundColor: colors.primary,
                        "&:hover": { backgroundColor: colors.primaryDark || "#d32f2f" },
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : "Send Message"}
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </Paper>

            {/* Social */}
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Follow Us
              </Typography>
              <Typography variant="body1" sx={{ color: colors.textSecondary, mb: 3 }}>
                Stay connected with us on social media
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center">
                <motion.div whileHover={{ y: -3 }}>
                  <IconButton
                    component="a"
                    href="https://www.instagram.com/sumansi.in/"
                    target="_blank"
                    rel="noopener"
                    sx={{
                      color: "#E1306C",
                      backgroundColor: `${colors.primary}10`,
                      "&:hover": { backgroundColor: `${colors.primary}20` },
                    }}
                  >
                    <InstagramIcon fontSize="large" />
                  </IconButton>
                </motion.div>
                <motion.div whileHover={{ y: -3 }}>
                  <IconButton
                    component="a"
                    href="https://www.facebook.com/share/1GZyRUNeUY/"
                    target="_blank"
                    rel="noopener"
                    sx={{
                      color: "#1877F2",
                      backgroundColor: `${colors.primary}10`,
                      "&:hover": { backgroundColor: `${colors.primary}20` },
                    }}
                  >
                    <FacebookIcon fontSize="large" />
                  </IconButton>
                </motion.div>
              </Stack>
            </Box>
          </motion.div>
        </Container>
      </Box>

      <Footer />
    </>
  );
};

export default Contact;