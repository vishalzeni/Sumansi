// filename: Hero.jsx
import React, { useState, useEffect, useRef } from "react";
import { useSwipeable } from "react-swipeable";
import { Box, Typography, Snackbar, Alert } from "@mui/material";
import colors from "../colors";
import { API_BASE_URL, ADMIN_API_KEY } from "../config";

/* ------------------- SHIMMER ------------------- */
const Shimmer = () => (
  <Box
    sx={{
      width: "100%",
      height: "100%",
      background: "linear-gradient(90deg, #f0f0f0 25%, #e5e5e5 50%, #f0f0f0 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.8s infinite",
      "@keyframes shimmer": {
        "0%": { backgroundPosition: "200% 0" },
        "100%": { backgroundPosition: "-200% 0" },
      },
    }}
  />
);

/* ------------------- HERO COMPONENT ------------------- */
const Hero = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const intervalRef = useRef(null);
  const API_KEY = ADMIN_API_KEY;

  /* ------------------- FETCH BANNERS ------------------- */
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/banner/active`, {
          headers: { "x-api-key": API_KEY },
        });
        if (!res.ok) throw new Error("Failed to load banners");
        const data = await res.json();
        setBanners(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, [API_KEY]);

  /* ------------------- AUTO SLIDE ------------------- */
  useEffect(() => {
    if (!banners.length || loading) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(intervalRef.current);
  }, [banners.length, loading]);

  /* ------------------- SWIPE ------------------- */
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
      resetTimer();
    },
    onSwipedRight: () => {
      setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
      resetTimer();
    },
    trackMouse: true,
  });

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
  };

  /* ------------------- RESPONSIVE HEIGHT (16:9) ------------------- */
  const sliderHeight = {
    xs: "56.25vw",   // 16:9 → height = width * 0.5625
    sm: "56.25vw",
    md: 400,
    lg: 500,
  };

  /* ------------------- LOADING ------------------- */
  if (loading) {
    return (
      <Box
        sx={{
          width: "100%",
          height: sliderHeight,
          overflow: "hidden",
          position: "relative",
          boxShadow: 3,
        }}
      >
        <Shimmer />
      </Box>
    );
  }

  /* ------------------- NO BANNERS ------------------- */
  if (!banners.length) {
    return (
      <Box
        sx={{
          width: "100%",
          height: sliderHeight,
          backgroundColor: colors.cardBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
          boxShadow: 3,
        }}
      >
        <Typography variant="h6" color="text.secondary" textAlign="center">
          No active banners
        </Typography>
      </Box>
    );
  }

  /* ------------------- MAIN SLIDER ------------------- */
  return (
    <Box
      {...handlers}
      sx={{
        width: "100%",
        height: sliderHeight,
        overflow: "hidden",
        position: "relative",
        boxShadow: 3,
        userSelect: "none",
      }}
    >
      {/* Slides */}
      <Box
        sx={{
          display: "flex",
          width: "100%",
          height: "100%",
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: "transform 0.6s ease",
        }}
      >
        {banners.map((banner) => (
          <Box
            key={banner._id}
            sx={{
              minWidth: "100%",
              height: "100%",
              backgroundImage: `url(${banner.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              flexShrink: 0,
            }}
          />
        ))}
      </Box>

      {/* Dots */}
      <Box
        sx={{
          position: "absolute",
          bottom: { xs: 12, sm: 16, md: 20 },
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 1.2,
          zIndex: 10,
        }}
      >
        {banners.map((_, i) => (
          <Box
            key={i}
            onClick={() => {
              setCurrentIndex(i);
              resetTimer();
            }}
            sx={{
              width: { xs: 8, sm: 10 },
              height: { xs: 8, sm: 10 },
              borderRadius: "50%",
              backgroundColor: currentIndex === i ? colors.primary : "rgba(255,255,255,0.6)",
              cursor: "pointer",
              transition: "all 0.3s",
              "&:hover": {
                backgroundColor: colors.primary,
                transform: "scale(1.3)",
              },
            }}
          />
        ))}
      </Box>

      {/* Error */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Hero;