import React, { useState, useEffect, useContext } from "react";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import CircularProgress from "@mui/material/CircularProgress";
import { API_BASE_URL } from "../config";

const Wishlist = ({ productId }) => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch wishlist status when productId or user changes
  useEffect(() => {
    // Always get token from localStorage for wishlist status
    const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
    if (!user || !token || !productId) {
      setWishlisted(false);
      return;
    }

    const fetchWishlistStatus = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/wishlist/${productId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.status === 401) {
          console.warn("Unauthorized: Invalid or expired token");
          setWishlisted(false);
          return;
        }

        if (!res.ok) {
          console.warn("Failed to fetch wishlist status");
          setWishlisted(false);
          return;
        }

        const data = await res.json();
        setWishlisted(!!data.wishlisted);
      } catch (err) {
        setWishlisted(false);
        console.error("Error fetching wishlist status:", err);
      }
    };

    fetchWishlistStatus();
  }, [productId, user]);

  // Toggle wishlist item
  const handleToggle = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    // Check login before any action
    if (!user) {
      navigate("/login");
      return;
    }
    setLoading(true);

    // Always get token from localStorage for toggle
    const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
    if (!user) {
      alert("you are not logged in, please login first.");
      return navigate("/login");
    }

    try {
      const res = await fetch(`${API_BASE_URL}/wishlist/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      if (res.status === 401) {
        alert("Session expired. Please login again.");
      }

      if (!res.ok) {
        const errMsg = await res.text();
        throw new Error(errMsg || "Wishlist update failed");
      }

      const data = await res.json();
      setWishlisted(!!data.wishlisted);
    } catch (err) {
      console.error("Error toggling wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IconButton
      onClick={handleToggle}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      sx={{
        p: 0.5,
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.9)",
        },
      }}
    >
      {loading ? (
        <CircularProgress size={24} />
      ) : wishlisted ? (
        <FavoriteIcon sx={{ color: "#e63946" }} />
      ) : (
        <FavoriteBorderIcon sx={{ color: "#333" }} />
      )}
    </IconButton>
  );
};

export default Wishlist;
