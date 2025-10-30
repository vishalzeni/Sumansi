import { Link } from "react-router-dom";
import React from "react";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Chip,
  Skeleton,
  Fade,
} from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import colors from "../colors";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Wishlist from "./Wishlist";
import { API_BASE_URL } from "../config";

const NewArrivalsCarousel = ({ id }) => {
  const [newArrivals, setNewArrivals] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

React.useEffect(() => {
  const fetchNewArrivals = async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await fetch(`${API_BASE_URL}/products/new-arrivals?limit=12`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setNewArrivals(data.products || []);
    } catch (err) {
      console.error("Error fetching new arrivals:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };
  fetchNewArrivals();
}, []);

  const LoadingSkeleton = React.memo(() => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
        },
        gap: 3,
      }}
    >
      {[...Array(8)].map((_, i) => (
        <Box key={i}>
          <Skeleton variant="rectangular" sx={{ width: "100%", aspectRatio: "1/1", borderRadius: 2 }} />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
        </Box>
      ))}
    </Box>
  ));

  const EmptyState = React.memo(() => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 8,
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          backgroundColor: colors.primary + "20",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
        }}
      >
        <AutoAwesomeIcon sx={{ fontSize: 40, color: colors.primary }} />
      </Box>
      <Typography variant="h6" color="text.secondary" fontWeight={500}>
        {error ? "Failed to load new arrivals" : "No new arrivals yet"}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {error ? "Please try again later." : "Check back soon for exciting new products!"}
      </Typography>
    </Box>
  ));

  const Header = React.memo(() => (
    <Box textAlign="center" mb={5}>
      <Box display="inline-flex" alignItems="center" gap={1} mb={1}>
        <AutoAwesomeIcon sx={{ color: colors.primary, fontSize: 22 }} />
        <Typography
          variant="h4"
          fontWeight={700}
          sx={{
            background: `linear-gradient(45deg, ${colors.primary}, ${colors.primary}CC)`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          New Arrivals
        </Typography>
        <AutoAwesomeIcon sx={{ color: colors.primary, fontSize: 22 }} />
      </Box>
      <Box
        sx={{
          width: 60,
          height: 3,
          backgroundColor: colors.primary,
          borderRadius: 2,
          mx: "auto",
        }}
      />
      <Typography variant="body2" color="text.secondary" mt={2}>
        Discover our latest collection of exciting new products.
      </Typography>
    </Box>
  ));

  const containerStyle = {
    px: { xs: 2, sm: 4, md: 8 },
    py: { xs: 4, md: 6 },
    maxWidth: "1440px",
    mx: "auto",
    background: "#fff",
    position: "relative",
  };

  if (loading) {
    return (
      <Box sx={containerStyle} id={id}>
        <Header />
        <LoadingSkeleton />
      </Box>
    );
  }

  if (newArrivals.length === 0) {
    return (
      <Box sx={containerStyle} id={id}>
        <Header />
        <EmptyState />
      </Box>
    );
  }

  return (
    <Fade in timeout={800}>
      <Box sx={containerStyle} id={id}>
        <Header />

        {/* Navigation Buttons */}
        <IconButton
          className="new-arrivals-prev"
          sx={{
            position: "absolute",
            top: "50%",
            left: { xs: 5, sm: 15 },
            transform: "translateY(-50%)",
            zIndex: 10,
            backgroundColor: "#fff",
            color: colors.primary,
            boxShadow: "0 3px 15px rgba(0,0,0,0.1)",
            "&:hover": { backgroundColor: colors.primary, color: "#fff" },
            display: newArrivals.length > 3 ? "flex" : "none",
          }}
        >
          <ChevronLeft />
        </IconButton>

        <IconButton
          className="new-arrivals-next"
          sx={{
            position: "absolute",
            top: "50%",
            right: { xs: 5, sm: 15 },
            transform: "translateY(-50%)",
            zIndex: 10,
            backgroundColor: "#fff",
            color: colors.primary,
            boxShadow: "0 3px 15px rgba(0,0,0,0.1)",
            "&:hover": { backgroundColor: colors.primary, color: "#fff" },
            display: newArrivals.length > 3 ? "flex" : "none",
          }}
        >
          <ChevronRight />
        </IconButton>

        {/* Swiper Carousel */}
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation={{
            prevEl: ".new-arrivals-prev",
            nextEl: ".new-arrivals-next",
          }}
          pagination={{ clickable: true, dynamicBullets: true }}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          spaceBetween={20}
          slidesPerView={1.2}
          loop={newArrivals.length > 3}
          breakpoints={{
            480: { slidesPerView: 1.5 },
            640: { slidesPerView: 2 },
            768: { slidesPerView: 2.5 },
            1024: { slidesPerView: 3 },
            1280: { slidesPerView: 4 },
          }}
          style={{ paddingBottom: 50 }}
        >
          {newArrivals.map((item, index) => (
            <SwiperSlide key={item.id || index}>
              <Link to={`/product/${item.id}`} style={{ textDecoration: "none" }}>
                <Card
                  sx={{
                    borderRadius: 2,
                    backgroundColor: "#fff",
                    border: `1px solid ${colors.border}40`,
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <Box sx={{ position: "relative" }}>
                    <CardMedia
                      component="img"
                      image={item.image}
                      alt={item.name}
                      sx={{
                        width: "100%",
                        objectFit: "cover",
                        transition: "transform 0.4s ease",
                        "&:hover": { transform: "scale(1.03)" },
                      }}
                    />
                    <Box sx={{ position: "absolute", top: 12, right: 12 }}>
                      <Wishlist productId={item.id} />
                    </Box>
                    <Chip
                      label="NEW"
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        backgroundColor: colors.primary,
                        color: "#fff",
                        fontWeight: 700,
                      }}
                    />
                  </Box>

                  <CardContent sx={{ textAlign: "left", p: 2 }}>
                    <Typography
                      variant="h6"
                      noWrap
                      sx={{
                        fontWeight: 600,
                        color: colors.primary,
                        fontSize: { xs: "1rem", sm: "1.1rem" },
                      }}
                    >
                      {item.name}
                    </Typography>
                  </CardContent>
                </Card>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </Fade>
  );
};

export default NewArrivalsCarousel;
