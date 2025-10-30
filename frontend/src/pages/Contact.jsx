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
  Skeleton,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import colors from "../colors";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Icons
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import RoomIcon from "@mui/icons-material/Room";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
};

const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!formData.message.trim()) newErrors.message = "Message is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      setLoading(true);
      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmissionStatus({
        type: "success",
        message: "Your message has been sent successfully!",
      });
      setFormData({ firstName: "", lastName: "", email: "", message: "" });
      setErrors({});
      setSnackbarOpen(true);
    } catch (error) {
      setSubmissionStatus({
        type: "error",
        message: "Failed to send message. Please try again.",
      });
    }
    setLoading(false);
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
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={submissionStatus?.type}
          sx={{ width: "100%" }}
        >
          {submissionStatus?.message}
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
            {/* Hero Section */}
            <Box
              sx={{
                textAlign: "center",
                mb: { xs: 6, md: 8 },
                maxWidth: 800,
                mx: "auto",
              }}
            >
              <Chip
                label="Contact Us"
                icon={
                  <ContactMailIcon
                    sx={{ fontSize: "1.2rem" }}
                    color={colors.primary}
                  />
                }
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
                sx={{
                  color: colors.textSecondary,
                  fontSize: { xs: "1rem", md: "1.25rem" },
                  lineHeight: 1.6,
                }}
              >
                We're here to help and answer any questions you might have.
                Reach out to us and we'll respond as soon as possible.
              </Typography>
            </Box>

            {/* Contact Cards */}
            <Grid container spacing={4} sx={{ mb: { xs: 6, md: 8 } }}>
              <Grid item xs={12} md={4}>
                <motion.div variants={slideUp}>
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      boxShadow: `0 8px 24px ${colors.primary}10`,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: `0 12px 28px ${colors.primary}20`,
                      },
                    }}
                  >
                    <CardContent
                      sx={{ p: { xs: 3, md: 4 }, textAlign: "center" }}
                    >
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
                      <Typography
                        variant="body1"
                        sx={{ mb: 3, color: colors.textSecondary }}
                      >
                        Available Monday to Friday from 9AM to 6PM
                      </Typography>
                      <Button
                        variant="contained"
                        href="tel:+919999999999"
                        startIcon={<PhoneIcon />}
                        sx={{
                          px: 3,
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          backgroundColor: colors.primary,
                          "&:hover": {
                            backgroundColor: colors.accent,
                          },
                        }}
                      >
                        +91 99999 99999
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              <Grid item xs={12} md={4}>
                <motion.div variants={slideUp} transition={{ delay: 0.1 }}>
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      boxShadow: `0 8px 24px ${colors.primary}10`,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: `0 12px 28px ${colors.primary}20`,
                      },
                    }}
                  >
                    <CardContent
                      sx={{ p: { xs: 3, md: 4 }, textAlign: "center" }}
                    >
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
                      <Typography
                        variant="body1"
                        sx={{ mb: 3, color: colors.textSecondary }}
                      >
                        We typically respond within 24 hours
                      </Typography>
                      <Button
                        variant="contained"
                        href="mailto:support@yourstore.com"
                        startIcon={<EmailIcon />}
                        sx={{
                          px: 3,
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          backgroundColor: colors.primary,
                          "&:hover": {
                            backgroundColor: colors.accent,
                          },
                        }}
                      >
                        support@yourstore.com
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>

              <Grid item xs={12} md={4}>
                <motion.div variants={slideUp} transition={{ delay: 0.2 }}>
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      boxShadow: `0 8px 24px ${colors.primary}10`,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: `0 12px 28px ${colors.primary}20`,
                      },
                    }}
                  >
                    <CardContent
                      sx={{ p: { xs: 3, md: 4 }, textAlign: "center" }}
                    >
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
                        <RoomIcon sx={{ fontSize: 32 }} />
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                        Visit Us
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ mb: 3, color: colors.textSecondary }}
                      >
                        123 Fashion Street
                        <br />
                        New Delhi, India 110001
                      </Typography>
                      <Button
                        variant="contained"
                        href="https://maps.google.com"
                        target="_blank"
                        startIcon={<RoomIcon />}
                        sx={{
                          px: 3,
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          backgroundColor: colors.primary,
                          "&:hover": {
                            backgroundColor: colors.accent,
                          },
                        }}
                      >
                        Get Directions
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>

            {/* Contact Form Section */}
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
              <Box
                sx={{
                  textAlign: "center",
                  mb: { xs: 4, md: 6 },
                  maxWidth: 600,
                  mx: "auto",
                }}
              >
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
                <Typography
                  variant="body1"
                  sx={{ color: colors.textSecondary }}
                >
                  Fill out the form below and our team will get back to you
                  shortly.
                </Typography>
              </Box>

              {submissionStatus && (
                <Alert
                  severity={submissionStatus.type}
                  sx={{ mb: 4, borderRadius: 2 }}
                >
                  {submissionStatus.message}
                </Alert>
              )}

              <Box
                sx={{
                  backgroundColor: "#fff",
                  p: { xs: 4, sm: 6 },
                  borderRadius: 4,
                  boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
                  mt: 6,
                  maxWidth: 600,
                  mx: "auto",
                }}
                component="form"
                noValidate
                autoComplete="off"
              >
                {loading && (
                  <Box sx={{ mb: 4 }}>
                    <Skeleton
                      variant="rectangular"
                      height={48}
                      sx={{ borderRadius: 3, mb: 2 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      height={48}
                      sx={{ borderRadius: 3, mb: 2 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      height={48}
                      sx={{ borderRadius: 3, mb: 2 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      height={120}
                      sx={{ borderRadius: 3, mb: 2 }}
                    />
                    <CircularProgress sx={{ color: colors.primary, mt: 2 }} />
                  </Box>
                )}
                <Stack spacing={4}>
                  <TextField
                    label="First Name"
                    fullWidth
                    required
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 3 },
                    }}
                  />
                  <TextField
                    label="Last Name"
                    fullWidth
                    required
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 3 },
                    }}
                  />
                  <TextField
                    label="Email Address"
                    type="email"
                    fullWidth
                    required
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 3 },
                    }}
                  />
                  <TextField
                    label="Your Message"
                    multiline
                    rows={5}
                    fullWidth
                    required
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": { borderRadius: 3 },
                    }}
                  />
                  <Box textAlign="center">
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        px: 6,
                        py: 1.5,
                        fontWeight: 600,
                        fontSize: "1rem",
                        borderRadius: 8,
                        backgroundColor: colors.primary,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: colors.primaryDark || "#d32f2f",
                        },
                      }}
                      onClick={handleSubmit}
                    >
                      Send Message
                    </Button>
                  </Box>
                </Stack>
                {loading && (
                  <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
                    Sending message...
                  </Alert>
                )}
              </Box>
            </Paper>

            {/* Social Media Section */}
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Follow Us
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: colors.textSecondary, mb: 3 }}
              >
                Stay connected with us on social media
              </Typography>
              <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
                sx={{ mb: 6 }}
              >
                <motion.div whileHover={{ y: -3 }}>
                  <IconButton
                    component="a"
                    href="https://instagram.com/yourstore"
                    target="_blank"
                    rel="noopener"
                    sx={{
                      color: "#E1306C",
                      backgroundColor: `${colors.primary}10`,
                      "&:hover": {
                        backgroundColor: `${colors.primary}20`,
                      },
                    }}
                    aria-label="Instagram"
                  >
                    <InstagramIcon fontSize="large" />
                  </IconButton>
                </motion.div>
                <motion.div whileHover={{ y: -3 }}>
                  <IconButton
                    component="a"
                    href="https://facebook.com/yourstore"
                    target="_blank"
                    rel="noopener"
                    sx={{
                      color: "#1877F2",
                      backgroundColor: `${colors.primary}10`,
                      "&:hover": {
                        backgroundColor: `${colors.primary}20`,
                      },
                    }}
                    aria-label="Facebook"
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
