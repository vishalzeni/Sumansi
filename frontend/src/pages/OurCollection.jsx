import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Container,
  Grid,
  CircularProgress,
  Paper,
} from "@mui/material";
import { Link } from "react-router-dom";
import colors from "../colors";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { API_BASE_URL } from "../config";

const OurCollection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  setLoading(true);
  fetch(`${API_BASE_URL}/products/categories`)
    .then((res) => res.json())
    .then((res) => setCategories(res.categories || []))
    .catch((err) => {
      console.error("Failed to fetch categories:", err);
      setCategories([]);
    })
    .finally(() => setLoading(false));
}, []);

useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <>
      <Header />
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: colors.primary,
            mb: 3,
            textAlign: "center",
          }}
        >
          Our Collection
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: colors.textSecondary, mb: 4, textAlign: "center" }}
        >
          Explore all categories. Click any category to view products.
        </Typography>
        {loading ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <CircularProgress sx={{ color: colors.primary }} />
          </Box>
        ) : categories.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Typography>No categories found.</Typography>
          </Paper>
        ) : (
          <Grid container spacing={3} justifyContent="center">
            {categories.map((cat) => (
              <Grid item key={cat}>
                <Link
                  to={`/category/${encodeURIComponent(cat)}`}
                  style={{ textDecoration: "none" }}
                >
                  <Chip
                    label={cat}
                    clickable
                    sx={{
                      px: 3,
                      py: 2,
                      fontWeight: 600,
                      fontSize: "1.1rem",
                      backgroundColor: colors.primary,
                      color: colors.badgeText,
                      "&:hover": {
                        backgroundColor: colors.accent,
                      },
                    }}
                  />
                </Link>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
      <Footer />
    </>
  );
};

export default OurCollection;
