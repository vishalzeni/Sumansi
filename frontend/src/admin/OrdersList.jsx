import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Divider,
} from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import colors from "../colors";
import { API_BASE_URL } from "../config";

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE_URL}/payment/all-orders`, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setError(data.error || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <Box p={{ xs: 2, sm: 3 }} sx={{ bgcolor: colors.background }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={{ xs: 2, sm: 3 }}
      >
        <Typography
          variant="h5"
          sx={{
            color: colors.primary,
            fontWeight: 600,
            fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
          }}
        >
          All Orders ({orders.length})
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchOrders}
          disabled={loading}
          sx={{
            textTransform: "none",
            borderColor: colors.primary,
            color: colors.primary,
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            "&:hover": {
              bgcolor: colors.primary + "12",
              borderColor: colors.primary,
            },
          }}
        >
          Refresh
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
          <CircularProgress size={40} sx={{ color: colors.primary }} />
        </Box>
      ) : error ? (
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            bgcolor: colors.error + "1a",
            border: `1px solid ${colors.error}`,
            textAlign: "center",
            borderRadius: 2,
          }}
        >
          <Typography
            color={colors.error}
            variant="body1"
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            {error}
          </Typography>
          <Button
            variant="outlined"
            color="error"
            onClick={fetchOrders}
            sx={{ mt: 2, textTransform: "none", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
          >
            Try Again
          </Button>
        </Paper>
      ) : orders.length === 0 ? (
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            textAlign: "center",
            bgcolor: "grey.50",
            borderRadius: 2,
          }}
        >
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            No orders found.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 1.5, sm: 2 } }}>
          {orders.map((order) => {
            const orderId = order.razorpayOrderId || order._id;
            const placedDate = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "-";
            const address = order.shippingAddress;

            return (
              <Paper
                key={orderId}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  boxShadow: `0 2px 8px ${colors.primary}1a`,
                  "&:hover": {
                    boxShadow: `0 4px 12px ${colors.primary}33`,
                  },
                }}
              >
                {/* Order Header */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={{ xs: 1.5, sm: 2 }}
                >
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: colors.primary,
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                      }}
                    >
                      Order Id: {orderId}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Placed: {placedDate}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: { xs: 1.5, sm: 2 } }} />

                {/* Order Details */}
                <Box
                  display="grid"
                  gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
                  gap={{ xs: 1.5, sm: 2 }}
                >
                  <Box sx={{ textAlign: "left" }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: "text.primary",
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        mb: 0.5,
                      }}
                    >
                      Customer Details
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Name: {address?.fullName || "N/A"}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Email: {address?.email || "N/A"}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Phone: {address?.phone || "N/A"}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Address: {address?.address || "N/A"}
                      {address?.city ? `, ${address.city}` : ""}
                      {address?.state ? `, ${address.state}` : ""}
                      {address?.pincode ? ` - ${address.pincode}` : ""}
                    </Typography>
                    {address?.landmark && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                      >
                        Landmark: {address.landmark}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color: "text.primary",
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        mb: 0.5,
                      }}
                    >
                      Payment Details
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Method: {order.paymentMethod || "N/A"}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: colors.primary,
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      }}
                    >
                      Total: ₹{order.totalAmount?.toLocaleString("en-IN") || "0"}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ mb: { xs: 1.5, sm: 2 }, borderColor: colors.grey, mt: 2 }} />

                {/* Items List */}
                <Box mt={{ xs: 1.5, sm: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: "text.primary",
                      mb: 1,
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    }}
                  >
                    Items ({order.items?.length || 0})
                  </Typography>
                  <Box component="ul" sx={{ pl: 0, m: 0, listStyle: "none" }}>
                    {order.items?.map((item, i) => (
                      <Box
                        key={i}
                        component="li"
                        sx={{
                          py: 0.75,
                          borderBottom:
                            i < order.items.length - 1 ? `1px solid ${colors.grey}33` : "none",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 1,
                          bgcolor: colors.background,
                          px: 1,
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              color: "text.primary",
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            }}
                          >
                            {item.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" }, textAlign: "left" }}
                          >
                            Product ID: {item.productId || "N/A"} | Qty: {item.qty ?? item.quantity} | Size: {item.size || "N/A"} {item.color ? ` | Color: ${item.color}` : ""}
                            {item.color ? ` | Color: ${item.color}` : ""}
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            color: colors.primary,
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          }}
                        >
                          ₹{item.price?.toLocaleString("en-IN")}
                        </Typography>
                      </Box>
                    )) || (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                      >
                        No items
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default OrdersList;