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
  CircularProgress,
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
    name: "Aarav Mehta",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=60",
    review:
      "Absolutely love the quality and style of the products. The fabric feels rich, and the stitching is top-notch. Delivery was super fast, and the packaging gave a premium unboxing experience. Will definitely be ordering again and recommending to friends!",
    rating: 5,
    date: "2 days ago",
  },
  {
    id: 2,
    name: "Priya Sharma",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=60",
    review:
      "Customer service was incredibly helpful and responsive. They guided me patiently to choose the perfect size. The fit is fantastic and feels custom-made. I'm genuinely impressed with how easy the whole shopping experience was from start to finish.",
    rating: 4.5,
    date: "1 week ago",
  },
  {
    id: 3,
    name: "Rahul Singh",
    avatar: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=200&auto=format&fit=crop&q=60",
    review:
      "This was my third order, and once again, everything was seamless. The collection is very well-curated with fresh designs and great prices. Website is easy to navigate, and payment options are smooth. Never had a single issue so far!",
    rating: 4,
    date: "3 days ago",
  },
  {
    id: 4,
    name: "Sneha Kapoor",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=60",
    review:
      "The outfit looked exactly like the pictures, if not better. The color was vibrant, the fit was flattering, and the feel of the fabric was extremely soft on the skin. I've already bookmarked a few more items for my next purchase. Highly recommended!",
    rating: 5,
    date: "2 weeks ago",
  },
  {
    id: 5,
    name: "Vikram Patel",
    avatar: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=200&auto=format&fit=crop&q=60",
    review:
      "For the price I paid, I wasn’t expecting such top-notch quality. The attention to detail, like the lining, stitching, and even the tag placement, shows that the brand really cares. It feels like a premium product at a very fair price. Truly exceeded expectations.",
    rating: 5,
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
