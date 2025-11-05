import React from "react";
import {
  Box,
  Typography,
  Card,
  Avatar,
  CardContent,
  Rating,
  useTheme,
  styled,
} from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import colors from "../colors";

const reviews = [
  {
    id: 1,
    name: "Ananya Verma",
    avatar:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&auto=format&fit=crop&q=60",
    review:
      "Absolutely loved my purchase! The dress looked even better in person — soft fabric, elegant fit, and the color didn’t fade after washing. It feels like something straight out of a boutique. Definitely ordering again soon!",
    rating: 5,
    date: "2 days ago",
  },
  {
    id: 2,
    name: "Ammy Rogan",
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&auto=format&fit=crop&q=60",
    review:
      "The saree I bought was stunning — lightweight, flowy, and super comfortable for an all-day event. Got so many compliments at the wedding! Delivery was quick and packaging was really classy too.",
    rating: 5,
    date: "1 week ago",
  },
  {
    id: 3,
    name: "Megha Nair",
    avatar:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=200&auto=format&fit=crop&q=60",
    review:
      "I was a little skeptical about ordering online, but the quality blew me away! The kurta set I received fits perfectly and feels so premium. The stitching and detailing are way better than what I expected for the price.",
    rating: 4.5,
    date: "3 days ago",
  },
  {
    id: 4,
    name: "Kritika Sen",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=60",
    review:
      "Such a refreshing shopping experience! The co-ord set I got was exactly like the photos — chic, comfortable, and perfect for summer. I’ve already shared the site with my sister and friends.",
    rating: 5,
    date: "2 weeks ago",
  },
  {
    id: 5,
    name: "Aishwarya Das",
    avatar:
      "https://images.unsplash.com/photo-1542596594-649edbc13630?w=200&auto=format&fit=crop&q=60",
    review:
      "This was my first order and I’m honestly impressed. The fit was spot-on, material felt soft on the skin, and the style was exactly what I wanted. You’ve earned a loyal customer!",
    rating: 4.8,
    date: "5 days ago",
  },
];


const ReviewCard = styled(Card)(({ theme }) => ({
  position: "relative",
  height: "auto",
  borderRadius: "20px",
  padding: "20px",
  background: theme.palette.mode === "dark"
    ? "#1e1e1e"
    : "#ffffff",
  border: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
  boxShadow: theme.palette.mode === "dark"
    ? "0 8px 24px rgba(0,0,0,0.3)"
    : "0 8px 20px rgba(0,0,0,0.06)",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: theme.palette.mode === "dark"
      ? "0 12px 30px rgba(0,0,0,0.4)"
      : "0 12px 24px rgba(0,0,0,0.08)",
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "3px",
    background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
    borderTopLeftRadius: "20px",
    borderTopRightRadius: "20px",
  },
}));

const CustomerReviews = () => {
  const theme = useTheme();
  // If you fetch reviews from API in future, add loading state here.
  // For now, reviews are static, so no spinner needed.
  // Example:
  // const [loading, setLoading] = React.useState(false);
  // if (loading) return <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 200 }}><CircularProgress sx={{ color: colors.primary }} /></Box>;

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 4, md: 8 },
        py: { xs: 4, md: 6 },
        maxWidth: "1440px",
        mx: "auto",
        background: colors.background,
        position: "relative",
        borderRadius: "24px",
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)", // Soft inner edge
        textAlign: "center",
        overflow: "hidden",
      }}
    >
        <Box
        sx={{
          position: 'absolute',
          inset: '-1px 0 -16px 0',
          [theme.breakpoints.up('md')]: {
            inset: '-2px 0 -6px 0'
          },
          maxWidth: '5xl',
          mx: 'auto',
          opacity: 0.2,
          filter: 'blur(34px)',
          background: 'linear-gradient(90deg, #44ff9a -0.55%, #44c1ffff 22.86%, #b444ffff 48.36%, #ff6644 73.33%, #ebff70 99.34%)',
          zIndex: 0
        }}
      />
      {/* Section Title */}
      <Box position="relative" zIndex={1} mb={4}>
        <Typography
          variant="h3"
          sx={{
            color: colors.primary,
            fontWeight: 700,
            mb: 2,
            fontSize: { xs: "2rem", md: "2.5rem" },
            lineHeight: 1.2,
          }}
        >
          What Our Customers Say
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            color: theme.palette.text.secondary,
            maxWidth: "700px",
            mx: "auto",
            fontSize: { xs: "1rem", md: "1.1rem" },
          }}
        >
          Trusted by thousands of happy customers across the country
        </Typography>
      </Box>

      {/* Carousel */}
      <Box
        sx={{
          maxWidth: "1440px",
          mx: "auto",
          position: "relative",
          zIndex: 1,
          "& .swiper-slide": {
            height: "auto",
            pb: 4,
          },
        }}
      >
        <Swiper
          modules={[Pagination, Autoplay]}
          autoplay={{
            delay: 8000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{
            clickable: true,
            bulletClass: "custom-bullet",
            bulletActiveClass: "custom-bullet-active",
          }}
          spaceBetween={30}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1.2, spaceBetween: 20 },
            900: { slidesPerView: 2, spaceBetween: 30 },
            1200: { slidesPerView: 3, spaceBetween: 30 },
          }}
style={{ paddingBottom: "40px", minHeight: "420px" }}
        >
          {reviews.map((item) => (
            <SwiperSlide key={item.id}>
              <ReviewCard>
                {/* User Info */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <Avatar
                    src={item.avatar}
                    alt={item.name}
                    loading="lazy"
                    sx={{
                      width: 64,
                      height: 64,
                      mb: 2,
                      border: `2px solid ${colors.primary}`,
                      boxShadow: `0 4px 12px ${colors.primary}30`,
                    }}
                  />
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "1.15rem",
                      mb: 0.5,
                    }}
                  >
                    {item.name}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 1,
                    }}
                  >
                    <Rating
                      value={item.rating}
                      readOnly
                      precision={0.5}
                      size="medium"
                      sx={{
                        color: "#FFC107",
                        mr: 1,
                        "& .MuiRating-iconFilled": {
                          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: 500,
                      }}
                    >
                      {item.date}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <VerifiedIcon
                      sx={{
                        fontSize: "18px",
                        mr: 1,
                        color: colors.primary,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        color: colors.primary,
                      }}
                    >
                      Verified Purchase
                    </Typography>
                  </Box>
                </Box>

                {/* Review Text */}
                <CardContent sx={{ px: 1, py: 0 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      color: theme.palette.text.secondary,
                      fontSize: "1.05rem",
                      lineHeight: 1.8,
                      position: "relative",
                      px: 2,
                      "&::before": {
                        content: '"“"',
                        position: "absolute",
                        left: "-10px",
                        top: "-5px",
                        fontSize: "3.5rem",
                        color: colors.primary,
                        opacity: 0.08,
                        fontFamily: "serif",
                      },
                    }}
                  >
                    {item.review}
                  </Typography>
                </CardContent>
              </ReviewCard>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>

      {/* Swiper Pagination Dots */}
      <style>{`
        .custom-bullet {
          width: 8px !important;
          height: 8px !important;
          background-color: #ccc !important;
          border-radius: 50%;
          margin: 0 5px !important;
          opacity: 0.6;
          transition: all 0.3s ease-in-out;
        }

        .custom-bullet-active {
          background-color: ${colors.primary} !important;
          opacity: 1;
          transform: scale(1.2);
        }

        .swiper-pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          bottom: 12px !important;
        }
      `}</style>
      
    </Box>

  );
};

export default CustomerReviews;
