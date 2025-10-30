import { useEffect, useState, useRef } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Divider,
  Stack,
  Chip,
  Fade,
  Zoom,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Print,
  Home,
  CheckCircle,
  Receipt,
  LocalShipping,
  Download,
  Share,
  Email,
  Person,
  Phone,
  LocationOn,
} from "@mui/icons-material";
import colors from "../colors";

const formatINR = (v) =>
  typeof v === "number" ? v.toLocaleString("en-IN") : v;

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const order =
    location.state || JSON.parse(localStorage.getItem("lastOrder") || "null");
  const [showSuccess, setShowSuccess] = useState(false);
  const contentRef = useRef(null); // Ref to capture the content for PDF

  useEffect(() => {
    if (!order) {
      navigate("/");
    } else {
      setShowSuccess(true);
    }
  }, [order, navigate]);

  if (!order) return null;

  const generateInvoiceHTML = () => `
    <html>
      <head>
        <title>Invoice - ${order.orderId}</title>
        <style>
          body { 
            font-family: 'Arial', sans-serif; 
            color: ${colors.icon}; 
            padding: 0;
            margin: 0;
            background: ${colors.background};
          }
          .invoice-container {
            max-width: 100%;
            width: 100%;
            margin: 10px auto;
            background: ${colors.cardBg};
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
            overflow: hidden;
            font-size: 14px;
          }
          .invoice-header {
            background: ${colors.primary};
            color: ${colors.badgeText};
            padding: 20px;
            text-align: center;
          }
          .invoice-content { padding: 20px 10px; }
          .header { 
            display: flex; 
            flex-direction: column;
            gap: 15px;
            margin-bottom: 20px;
          }
          .header-left, .header-right {
            width: 100%;
            text-align: left;
          }
          .brand-logo { 
            max-width: 100px; 
            height: auto; 
            margin-bottom: 8px;
            background: ${colors.cardBg};
            padding: 6px;
            border-radius: 6px;
          }
          .success-badge {
            background: #28a745;
            color: ${colors.badgeText};
            padding: 6px 15px;
            border-radius: 16px;
            display: inline-block;
            margin-bottom: 10px;
            font-weight: 600;
            font-size: 12px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0;
            font-size: 12px;
          }
          th, td { 
            border-bottom: 1px solid ${colors.border}; 
            padding: 8px; 
            text-align: left; 
          }
          th { 
            background: ${colors.drawerBg};
            font-weight: 600;
            color: ${colors.icon};
          }
          .totals { 
            background: ${colors.drawerBg};
            border-radius: 6px;
            padding: 10px;
            margin-top: 15px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            margin: 6px 0;
          }
          .total-amount {
            font-size: 16px;
            font-weight: 700;
            color: ${colors.primary};
            border-top: 2px solid ${colors.border};
            padding-top: 8px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            padding: 15px;
            background: ${colors.drawerBg};
            border-radius: 6px;
            color: ${colors.icon};
            font-size: 12px;
          }
          @media print {
            .invoice-container {
              box-shadow: none;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="invoice-header">
            <img src="/SUMAN.png" class="brand-logo" alt="Store Logo" />
            <div style="opacity: 0.9; font-size: 12px;">Invoice #: ${
              order.orderId
            }</div>
            <div style="opacity: 0.9; font-size: 12px;">Date: ${new Date(
              order.createdAt || Date.now()
            ).toLocaleString()}</div>
          </div>
          
          <div class="invoice-content">
            <div class="header">
              <div class="header-left">
                <strong style="font-size: 14px;">ORDER DETAILS</strong><br/>
                Order ID: ${order.orderId}<br/>
                ${
                  order.paymentId ? `Payment ID: ${order.paymentId}<br/>` : ""
                }
                Payment: ${
                  order.paymentMethod || (order.isCOD ? "COD" : "Online")
                }<br/>
                Status: Confirmed
              </div>
              <div class="header-right">
                <strong style="font-size: 14px;">CUSTOMER INFO</strong><br/>
                ${order.shippingAddress?.fullName || ""}<br/>
                📞 ${order.shippingAddress?.phone || ""}<br/>
                ✉️ ${order.shippingAddress?.email || ""}
              </div>
            </div>
            <div style="margin-bottom: 20px;">
              <strong style="font-size: 14px;">SHIPPING ADDRESS</strong><br/>
              ${order.shippingAddress?.address || ""}, ${
                order.shippingAddress?.city || ""
              }, ${order.shippingAddress?.pincode || ""}, ${
                order.shippingAddress?.state || ""
              }
            </div>

            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item</th>
                  <th>Variant</th>
                  <th>Qty</th>
                  <th style="text-align: right;">Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.items
                  .map(
                    (it, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td><strong>${it.name}</strong></td>
                    <td>${it.size || ""} ${it.color ? " / " + it.color : ""}</td>
                    <td>${it.qty}</td>
                    <td style="text-align: right;">₹${formatINR(it.price)}</td>
                    <td style="text-align: right; font-weight: 600;">₹${formatINR(
                      it.price * it.qty
                    )}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>

            <div class="totals">
              ${(() => {
                const subtotal = order.items.reduce(
                  (s, it) => s + (it.price || 0) * (it.qty || 1),
                  0
                );
                const shipping = order.totalAmount - subtotal;
                return `
                  <div class="totals-row">
                    <div>Subtotal:</div>
                    <div>₹${formatINR(subtotal)}</div>
                  </div>
                  <div class="totals-row">
                    <div>Shipping:</div>
                    <div>₹${formatINR(shipping)}</div>
                  </div>
                  <div class="totals-row total-amount">
                    <div>Total Amount:</div>
                    <div>₹${formatINR(order.totalAmount)}</div>
                  </div>
                `;
              })()}
            </div>

            <div class="footer">
              Thank you for your purchase! We appreciate your business.<br/>
              For any queries, contact us at <strong>info@sumansi.in</strong> or call <strong>+91-93150-36994</strong>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const printInvoice = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(generateInvoiceHTML());
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.print();
    }, 500);
  };

  const downloadPDF = () => {
    // Instead of capturing the page as an image (screenshot) using html2canvas/jsPDF,
    // open a new window with the invoice HTML and trigger the browser print dialog.
    // When users choose "Save as PDF" in the print dialog, the resulting PDF will
    // preserve selectable text and better-quality vector/HTML rendering.
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(generateInvoiceHTML());
    w.document.close();
    w.focus();
    // Give the new window a moment to load resources, then open print dialog.
    setTimeout(() => {
      w.print();
      // Optionally keep the window open so users can inspect before saving.
      // If you prefer to close it automatically after printing, uncomment next line:
      // w.close();
    }, 500);
  };

  const shareOrder = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Order Confirmation - ${order.orderId}`,
          text: `I just placed an order! Order ID: ${order.orderId}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(
        `Order ID: ${order.orderId}\nTotal: ₹${formatINR(
          order.totalAmount
        )}\nDate: ${new Date(order.createdAt || Date.now()).toLocaleString()}`
      );
      alert("Order details copied to clipboard!");
    }
  };

  const subtotal = order.items.reduce(
    (s, it) => s + (it.price || 0) * (it.qty || 1),
    0
  );
  const shipping = order.totalAmount - subtotal;

  return (
    <Fade in={showSuccess} timeout={600}>
      <Box
        ref={contentRef}
        sx={{
          minHeight: "100vh",
          background: `linear-gradient(135deg, #e2ffebff 0%, #f8f9fa 100%)`,
          py: { xs: 2, sm: 3 },
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          {/* Success Header with Animation */}
          <Zoom in={showSuccess} timeout={500}>
            <Box sx={{ textAlign: "center", mb: { xs: 3, sm: 4 } }}>
              <Box
                sx={{
                  background:
                    "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
                  borderRadius: "16px",
                  padding: { xs: "20px", sm: "30px" },
                  display: "inline-block",
                  boxShadow: "0 4px 20px rgba(40, 167, 69, 0.2)",
                  maxWidth: { xs: "100%", sm: "500px" },
                  width: "100%",
                }}
              >
                <CheckCircle
                  sx={{
                    fontSize: { xs: 48, sm: 64 },
                    color: colors.badgeText,
                    mb: 2,
                  }}
                />
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  sx={{
                    color: colors.badgeText,
                    mb: 1,
                    fontSize: { xs: "1.5rem", sm: "2rem" },
                  }}
                >
                  Order Confirmed!
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.badgeText,
                    opacity: 0.9,
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    maxWidth: "90%",
                    mx: "auto",
                  }}
                >
                  Thank you for your purchase. Your order has been successfully
                  placed and is being processed.
                </Typography>
              </Box>
            </Box>
          </Zoom>

          {/* Order Status Progress */}
          <Box sx={{ mb: { xs: 3, sm: 4 }, maxWidth: 800, mx: "auto" }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1, sm: 2 }}
              justifyContent="center"
              alignItems="center"
            >
              <Chip
                icon={<CheckCircle />}
                label="Order Placed"
                color="success"
                variant="filled"
                sx={{
                  px: 2,
                  py: 0.5,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                }}
              />
              <Box
                sx={{
                  width: { xs: 0, sm: 40 },
                  height: { xs: 0, sm: 2 },
                  bgcolor: colors.border,
                  mx: { xs: 0, sm: 1 },
                }}
              />
              <Chip
                icon={<LocalShipping />}
                label="Processing"
                color="primary"
                variant="outlined"
                sx={{
                  px: 2,
                  py: 0.5,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                }}
              />
              <Box
                sx={{
                  width: { xs: 0, sm: 40 },
                  height: { xs: 0, sm: 2 },
                  bgcolor: colors.border,
                  mx: { xs: 0, sm: 1 },
                }}
              />
              <Chip
                icon={<Receipt />}
                label="Shipped"
                color="default"
                variant="outlined"
                sx={{
                  px: 2,
                  py: 0.5,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                }}
              />
            </Stack>
          </Box>

          {/* Main Invoice Card */}
          <Zoom in={showSuccess} timeout={600} style={{ transitionDelay: "100ms" }}>
            <Paper
              sx={{
                maxWidth: 900,
                mx: "auto",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                background: colors.cardBg,
                border: `1px solid ${colors.border}`,
              }}
            >
              {/* Invoice Header */}
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 100%)`,
                  color: colors.badgeText,
                  padding: { xs: "15px", sm: "20px", md: "30px" },
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <img
                  src="/SUMAN.png"
                  alt="Store Logo"
                  style={{
                    width: "30%",
                    height: "auto",
                    background: colors.cardBg,
                    padding: "6px",
                    borderRadius: "6px",
                    marginBottom: "10px",
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    opacity: 0.95,
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                  }}
                >
                  Invoice ID: {order.orderId}
                </Typography>
                <Typography
                  sx={{
                    opacity: 0.8,
                    fontSize: { xs: "0.75rem", sm: "0.9rem" },
                  }}
                >
                  {new Date(order.createdAt || Date.now()).toLocaleString()}
                </Typography>
              </Box>

              {/* Quick Stats */}
              <Box
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  bgcolor: colors.drawerBg,
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 1.5, sm: 2 }}
                  justifyContent="space-around"
                >
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="caption"
                      color={colors.icon}
                      display="block"
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Items
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color={colors.primary}
                      sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                    >
                      {order.items.reduce((sum, item) => sum + item.qty, 0)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="caption"
                      color={colors.icon}
                      display="block"
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Total Amount
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color={colors.primary}
                      sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                    >
                      ₹{formatINR(order.totalAmount)}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      variant="caption"
                      color={colors.icon}
                      display="block"
                      sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                    >
                      Payment
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color={colors.primary}
                      sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                    >
                      {order.paymentMethod || (order.isCOD ? "COD" : "Online")}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Invoice Content */}
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                {/* Order Info and Customer Info */}
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={{ xs: 2, md: 3 }}
                  sx={{ mb: { xs: 2, sm: 3 } }}
                >
                  <Paper
                    sx={{
                      flex: 1,
                      p: { xs: 1.5, sm: 2 },
                      bgcolor: colors.drawerBg,
                      borderRadius: "8px",
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{
                        mb: 1.5,
                        color: colors.icon,
                        display: "flex",
                        alignItems: "center",
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                      }}
                    >
                      <Receipt sx={{ mr: 1, fontSize: { xs: 18, sm: 20 } }} />
                      ORDER DETAILS
                    </Typography>
                    <Stack spacing={1}>
                      <Box
                        sx={{ display: "flex", justifyContent: "space-between" }}
                      >
                        <Typography
                          variant="body2"
                          color={colors.icon}
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          Order ID:
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          color={colors.icon}
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          {order.orderId}
                        </Typography>
                      </Box>
                      {order.paymentId && (
                        <Box
                          sx={{ display: "flex", justifyContent: "space-between" }}
                        >
                          <Typography
                            variant="body2"
                            color={colors.icon}
                            sx={{
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            }}
                          >
                            Payment ID:
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight="medium"
                            color={colors.icon}
                            sx={{
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            }}
                          >
                            {order.paymentId}
                          </Typography>
                        </Box>
                      )}
                      <Box
                        sx={{ display: "flex", justifyContent: "space-between" }}
                      >
                        <Typography
                          variant="body2"
                          color={colors.icon}
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          Order Date:
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          color={colors.icon}
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          {new Date(order.createdAt || Date.now()).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="body2"
                          color={colors.icon}
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          Payment Method:
                        </Typography>
                        <Chip
                          label={
                            order.paymentMethod || (order.isCOD ? "COD" : "Online")
                          }
                          size="small"
                          color={order.isCOD ? "warning" : "success"}
                          variant="outlined"
                          sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                        />
                      </Box>
                    </Stack>
                  </Paper>

                  <Paper
                    sx={{
                      flex: 1,
                      p: { xs: 1.5, sm: 2 },
                      bgcolor: colors.drawerBg,
                      borderRadius: "8px",
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{
                        mb: 1.5,
                        color: colors.icon,
                        display: "flex",
                        alignItems: "center",
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                      }}
                    >
                      <Person sx={{ mr: 1, fontSize: { xs: 18, sm: 20 } }} />
                      CUSTOMER INFO
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Person
                          sx={{
                            fontSize: { xs: 16, sm: 18 },
                            mr: 1,
                            color: colors.primary,
                          }}
                        />
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          color={colors.icon}
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          {order.shippingAddress?.fullName}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Phone
                          sx={{
                            fontSize: { xs: 16, sm: 18 },
                            mr: 1,
                            color: colors.primary,
                          }}
                        />
                        <Typography
                          variant="body2"
                          color={colors.icon}
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          {order.shippingAddress?.phone}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Email
                          sx={{
                            fontSize: { xs: 16, sm: 18 },
                            mr: 1,
                            color: colors.primary,
                          }}
                        />
                        <Typography
                          variant="body2"
                          color={colors.icon}
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          {order.shippingAddress?.email}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Stack>

                {/* Shipping Address */}
                <Paper
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    mb: { xs: 2, sm: 3 },
                    bgcolor: colors.drawerBg,
                    borderRadius: "8px",
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{
                      mb: 1,
                      color: colors.icon,
                      display: "flex",
                      alignItems: "center",
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                  >
                    <LocationOn sx={{ mr: 1, fontSize: { xs: 18, sm: 20 } }} />
                    SHIPPING ADDRESS
                  </Typography>
                  <Typography
                    variant="body2"
                    color={colors.icon}
                    sx={{
                      textAlign: "left",
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    }}
                  >
                    {order.shippingAddress?.address}, {order.shippingAddress?.city},{" "}
                    {order.shippingAddress?.pincode}, {order.shippingAddress?.state}
                  </Typography>
                </Paper>

                {/* Order Items Table */}
                <Paper
                  sx={{
                    overflowX: "auto",
                    borderRadius: "8px",
                    border: `1px solid ${colors.border}`,
                    mb: { xs: 2, sm: 3 },
                  }}
                >
                  <Table
                    size="small"
                    sx={{
                      minWidth: { xs: 600, sm: 650 },
                      borderCollapse: "collapse",
                      "& .MuiTableCell-root": {
                        borderBottom: `1px solid ${colors.border}`,
                        px: { xs: 1, sm: 2 },
                        py: 1,
                      },
                    }}
                  >
                    <TableHead sx={{ bgcolor: colors.drawerBg }}>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            color: colors.icon,
                          }}
                        >
                          #
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            color: colors.icon,
                          }}
                        >
                          Item
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            color: colors.icon,
                          }}
                        >
                          Variant
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            color: colors.icon,
                          }}
                        >
                          Qty
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            color: colors.icon,
                          }}
                        >
                          Price
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 700,
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            color: colors.icon,
                          }}
                        >
                          Total
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.items.map((it, i) => (
                        <TableRow
                          key={i}
                          sx={{
                            "&:last-child td": { borderBottom: 0 },
                            "&:hover": { bgcolor: colors.drawerBg },
                          }}
                        >
                          <TableCell
                            sx={{
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              color: colors.icon,
                            }}
                          >
                            {i + 1}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              color: colors.icon,
                              fontWeight: 600,
                            }}
                          >
                            {it.name}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              color: colors.icon,
                            }}
                          >
                            {it.size || ""} {it.color ? " / " + it.color : ""}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              color: colors.icon,
                            }}
                          >
                            {it.qty}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              color: colors.icon,
                            }}
                          >
                            ₹{formatINR(it.price)}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              color: colors.icon,
                              fontWeight: 600,
                            }}
                          >
                            ₹{formatINR(it.price * it.qty)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>

                {/* Order Totals */}
                <Paper
                  sx={{
                    bgcolor: colors.drawerBg,
                    borderRadius: "8px",
                    p: { xs: 2, sm: 3 },
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <Box sx={{ maxWidth: { xs: "100%", sm: 300 }, ml: "auto" }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1.5,
                      }}
                    >
                      <Typography
                        sx={{
                          color: colors.icon,
                          fontSize: { xs: "0.875rem", sm: "0.95rem" },
                        }}
                      >
                        Subtotal:
                      </Typography>
                      <Typography
                        sx={{
                          color: colors.icon,
                          fontSize: { xs: "0.875rem", sm: "0.95rem" },
                        }}
                      >
                        ₹{formatINR(subtotal)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1.5,
                      }}
                    >
                      <Typography
                        sx={{
                          color: colors.icon,
                          fontSize: { xs: "0.875rem", sm: "0.95rem" },
                        }}
                      >
                        Shipping:
                      </Typography>
                      <Typography
                        sx={{
                          color: colors.icon,
                          fontSize: { xs: "0.875rem", sm: "0.95rem" },
                        }}
                      >
                        ₹{formatINR(shipping)}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 1.5 }} />
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography
                        sx={{
                          color: colors.icon,
                          fontSize: { xs: "1rem", sm: "1.1rem" },
                          fontWeight: 700,
                        }}
                      >
                        Total Amount:
                      </Typography>
                      <Typography
                        sx={{
                          color: colors.primary,
                          fontSize: { xs: "1rem", sm: "1.1rem" },
                          fontWeight: 700,
                        }}
                      >
                        ₹{formatINR(order.totalAmount)}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* Action Buttons */}
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: { xs: 1, sm: 2 },
                    mt: { xs: 3, sm: 4 },
                    pt: { xs: 2, sm: 3 },
                    borderTop: `1px solid ${colors.border}`,
                  }}
                >
                  <Button
                    variant="contained"
                    size="medium"
                    startIcon={<Print />}
                    onClick={printInvoice}
                    sx={{
                      bgcolor: colors.primary,
                      color: colors.badgeText,
                      px: { xs: 2, sm: 3 },
                      py: 1,
                      borderRadius: "8px",
                      fontSize: { xs: "0.75rem", sm: "0.9rem" },
                      fontWeight: 600,
                      minWidth: { xs: "40%", sm: "auto" },
                      "&:hover": {
                        bgcolor: colors.primary,
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    Print Invoice
                  </Button>
                  <Button
                    variant="contained"
                    size="medium"
                    startIcon={<Download />}
                    onClick={downloadPDF}
                    sx={{
                      bgcolor: "#6c757d",
                      color: colors.badgeText,
                      px: { xs: 2, sm: 3 },
                      py: 1,
                      borderRadius: "8px",
                      fontSize: { xs: "0.75rem", sm: "0.9rem" },
                      fontWeight: 600,
                      minWidth: { xs: "40%", sm: "auto" },
                      "&:hover": {
                        bgcolor: "#5a6268",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    Download PDF
                  </Button>
                  <Button
                    variant="outlined"
                    size="medium"
                    startIcon={<Share />}
                    onClick={shareOrder}
                    sx={{
                      px: { xs: 2, sm: 3 },
                      py: 1,
                      borderRadius: "8px",
                      fontSize: { xs: "0.75rem", sm: "0.9rem" },
                      fontWeight: 600,
                      color: colors.primary,
                      borderColor: colors.border,
                      minWidth: { xs: "40%", sm: "auto" },
                      "&:hover": {
                        borderColor: colors.primary,
                        bgcolor: `${colors.primary}08`,
                        transform: "translateY(-1px)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    Share Order
                  </Button>
                  <Button
                    variant="outlined"
                    size="medium"
                    startIcon={<Home />}
                    onClick={() => navigate("/")}
                    sx={{
                      px: { xs: 2, sm: 3 },
                      py: 1,
                      borderRadius: "8px",
                      fontSize: { xs: "0.75rem", sm: "0.9rem" },
                      fontWeight: 600,
                      color: colors.primary,
                      borderColor: colors.primary,
                      minWidth: { xs: "40%", sm: "auto" },
                      "&:hover": {
                        borderColor: colors.primary,
                        bgcolor: `${colors.primary}08`,
                        transform: "translateY(-1px)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    Continue Shopping
                  </Button>
                </Box>

                {/* Footer Note */}
                <Box
                  sx={{
                    textAlign: "center",
                    mt: { xs: 3, sm: 4 },
                    p: { xs: 2, sm: 3 },
                    bgcolor: colors.drawerBg,
                    borderRadius: "8px",
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <Typography
                    sx={{
                      color: colors.icon,
                      fontSize: { xs: "0.75rem", sm: "0.9rem" },
                      lineHeight: 1.6,
                    }}
                  >
                    <strong>Thank you for your purchase!</strong> We appreciate your
                    business and will process your order promptly.<br />
                    For any queries, contact us at{" "}
                    <strong>info@sumansi.in</strong> or call{" "}
                    <strong>+91-93150-36994</strong>
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Zoom>
        </Container>
      </Box>
    </Fade>
  );
};

export default OrderSuccess;