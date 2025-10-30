import React, { useState, useEffect, useRef } from "react";
import { useSwipeable } from "react-swipeable";
import { Box, useMediaQuery, useTheme, CircularProgress, Typography, Snackbar, Alert, Skeleton } from "@mui/material";
import colors from "../colors";
import { API_BASE_URL, ADMIN_API_KEY } from "../config";

const Hero = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [banners, setBanners] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const extendedBanners = banners.length
    ? [banners[banners.length - 1], ...banners, banners[0]]
    : [];
  const [index, setIndex] = useState(1); // Start at first real slide
  const sliderRef = useRef(null);
  const timerRef = useRef(null);

  const API_KEY = ADMIN_API_KEY;

  // Fetch banners directly from API
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/banner/active`, {
        headers: { "x-api-key": API_KEY },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch banners: ${res.statusText}`);
      }
      const data = await res.json();
      setBanners(data);
    } catch (err) {
      setError("Failed to load banners. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch banners on mount
  useEffect(() => {
    fetchBanners();
  }, []);

  // Handle auto-slide
  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIndex((prev) => prev + 1);
    }, 4000);
  };

  useEffect(() => {
    if (banners.length > 0) {
      resetTimer();
      return () => clearInterval(timerRef.current);
    }
  }, [banners]);

  // Smooth infinite loop handler
  useEffect(() => {
    const total = extendedBanners.length;
    const slider = sliderRef.current;

    if (!slider || !total) return;

    slider.style.transition = "transform 0.6s ease";
    slider.style.transform = `translateX(-${index * (100 / total)}%)`;

    const handleTransitionEnd = () => {
      if (index === 0) {
        slider.style.transition = "none";
        setIndex(banners.length);
        slider.style.transform = `translateX(-${banners.length * (100 / total)}%)`;
      } else if (index === total - 1) {
        slider.style.transition = "none";
        setIndex(1);
        slider.style.transform = `translateX(-${100 / total}%)`;
      }
    };

    slider.addEventListener("transitionend", handleTransitionEnd);
    return () => slider.removeEventListener("transitionend", handleTransitionEnd);
  }, [index, extendedBanners.length]);

  // Swipe support
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      setIndex((prev) => prev + 1);
      resetTimer();
    },
    onSwipedRight: () => {
      setIndex((prev) => prev - 1);
      resetTimer();
    },
    trackMouse: true,
  });

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          width: "100%",
          height: isMobile ? "300px" : "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <Skeleton variant="rectangular" width="80%" height={isMobile ? 300 : 400} sx={{ borderRadius: 3, mr: 2 }} />
        <CircularProgress />
        <Typography ml={2}>Loading banners...</Typography>
      </Box>
    );
  }

  // No banners state
  if (!banners.length) {
    return (
      <Box
        sx={{
          width: "100%",
          height: isMobile ? "300px" : "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <Typography variant="h6" color="textSecondary">
          No active banners available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      {...swipeHandlers}
      sx={{
        width: "100%",
        height: {
          sm: "calc(100vh - 64px)",
          md: "calc(100vh - 72px)",
        },
        minHeight: isMobile ? "300px" : "400px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Slide container */}
      <Box
        ref={sliderRef}
        sx={{
          display: "flex",
          width: `${extendedBanners.length * 100}%`,
          height: "100%",
        }}
      >
        {extendedBanners.map((banner, i) => (
          <Box
            key={banner._id ? `${banner._id}-${i}` : i} // Use _id for unique key
            sx={{
              width: `${100 / extendedBanners.length}%`,
              height: "100%",
              backgroundImage: `url(${banner.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
        ))}
      </Box>

      {/* Dot Indicators */}
      <Box
        sx={{
          position: "absolute",
          bottom: { xs: 10, sm: 20 },
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 1.5,
        }}
      >
        {banners.map((_, i) => (
          <Box
            key={banners[i]._id}
            onClick={() => {
              setIndex(i + 1);
              resetTimer();
            }}
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: index === i + 1 ? colors.primary : "#ccc",
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
          />
        ))}
      </Box>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Hero;