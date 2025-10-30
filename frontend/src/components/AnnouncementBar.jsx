import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, useTheme, useMediaQuery, CircularProgress, Skeleton } from "@mui/material";
import colors from "../colors";
import axios from "axios";
import { API_BASE_URL } from "../config";

const AnnouncementBar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const SLIDE_DURATION = 4000;
  const ITEM_HEIGHT = isMobile ? 32 : isTablet ? 36 : 40;
  const STAR_SIZE = isMobile ? 16 : isTablet ? 20 : 22.5;
  const STAR_COUNT = isMobile ? 1 : isTablet ? 2 : 3;

  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  // Fetch announcements from backend
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/announcements`);
        setAnnouncements(data.length ? data.map(a => a.text) : []);
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
      }
      setLoading(false);
    };
    fetchAnnouncements();
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (!announcements.length) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, [announcements]);

  // Reset animation at the end
  useEffect(() => {
    if (!announcements.length) return;

    const LOOPED_ANNOUNCEMENTS = [...announcements, announcements[0]];

    if (currentIndex === LOOPED_ANNOUNCEMENTS.length - 1) {
      setTimeout(() => {
        setAnimate(false);
        setCurrentIndex(0);
      }, 400);
    } else {
      setAnimate(true);
    }
  }, [currentIndex, announcements]);

  const SparklingStar = ({ size = STAR_SIZE }) => (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        position: "relative",
        margin: "0 1px",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="#FFD700"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: "drop-shadow(0 0 2px rgba(255, 215, 0, 0.5))",
        }}
      >
        <path d="M12 2L13.88 8.09L20.36 8.63L15.18 12.97L16.91 19.37L12 15.77L7.09 19.37L8.82 12.97L3.64 8.63L10.12 8.09L12 2Z" />
      </svg>
      <span
        style={{
          position: "absolute",
          top: "-6px",
          left: "-6px",
          width: "200%",
          height: "200%",
          borderRadius: "50%",
          background: "radial-gradient(rgba(255,215,0,0.25), transparent 60%)",
          animation: "pulse 2s infinite",
        }}
      />
    </span>
  );

  const renderStars = (count) => Array.from({ length: count }).map((_, i) => <SparklingStar key={i} />);

  const LOOPED_ANNOUNCEMENTS = announcements.length
    ? [...announcements, announcements[0]]
    : [];

  return (
    <Box
      sx={{
        width: "100%",
        height: ITEM_HEIGHT,
        backgroundColor: colors.primary,
        color: colors.background,
        position: "sticky",
        top: 0,
        zIndex: 1000,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
          <Skeleton variant="rectangular" width="80%" height={ITEM_HEIGHT} sx={{ borderRadius: 2, mr: 2 }} />
          <CircularProgress sx={{ color: colors.primary, width: 24, height: 24 }} size={20} />
        </Box>
      ) : LOOPED_ANNOUNCEMENTS.length > 0 && (
        <Box
          ref={containerRef}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            transform: `translateY(-${currentIndex * ITEM_HEIGHT}px)`,
            transition: animate ? "transform 0.4s ease-in-out" : "none",
          }}
        >
          {LOOPED_ANNOUNCEMENTS.map((msg, i) => (
            <Box
              key={i}
              sx={{
                height: ITEM_HEIGHT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: isMobile ? 0.5 : 1,
                px: isMobile ? 1 : 2,
              }}
            >
              {renderStars(STAR_COUNT)}

              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  fontSize: {
                    xs: "0.75rem",
                    sm: "0.875rem",
                    md: "1rem",
                    lg: "1.125rem",
                  },
                  maxWidth: isMobile ? "auto" : isTablet ? "350px" : "none",
                  mx: isMobile ? 0.5 : 1,
                }}
              >
                {msg}
              </Typography>

              {renderStars(STAR_COUNT)}
            </Box>
          ))}
        </Box>
      )}

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.3); opacity: 0.2; }
            100% { transform: scale(1); opacity: 0.8; }
          }
        `}
      </style>
    </Box>
  );
};

export default AnnouncementBar;
