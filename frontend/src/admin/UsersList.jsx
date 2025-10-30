import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Card,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  TableSortLabel,
  Pagination,
  Collapse,
  IconButton,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import colors from "../colors";
import * as XLSX from "xlsx";
import { API_BASE_URL } from "../config";

// Constants for better maintainability
const ROWS_PER_PAGE = 10;
const MAX_ORDERS_DISPLAY = 5;
const DEBOUNCE_DELAY = 300;

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [orderBy, setOrderBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [expandedUsers, setExpandedUsers] = useState(new Set());
  const [ordersMap, setOrdersMap] = useState(new Map());
  const [loadingStates, setLoadingStates] = useState(new Map());

  // Memoized API calls
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${API_BASE_URL}/users`, {
        credentials: "include",
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setError(data.error || "Failed to fetch users");
      }
    } catch (err) {
      setError("Failed to fetch users");
      console.error("Users fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserOrders = useCallback(async (email) => {
    if (ordersMap.has(email)) return; // Avoid refetching

    try {
      setLoadingStates(prev => new Map(prev.set(email, true)));
      
      const response = await fetch(
        `${API_BASE_URL}/payment/orders?email=${encodeURIComponent(email)}`,
        { credentials: "include" }
      );
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      if (Array.isArray(data)) {
        setOrdersMap(prev => new Map(prev.set(email, data)));
      } else {
        throw new Error(data.error || "Failed to fetch orders");
      }
    } catch (err) {
      console.error(`Orders fetch error for ${email}:`, err);
      // Don't store error state to avoid memory leaks
    } finally {
      setLoadingStates(prev => {
        const newMap = new Map(prev);
        newMap.delete(email);
        return newMap;
      });
    }
  }, [ordersMap]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on search
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [search]);

  // Optimized filtering and sorting
  const filteredAndSortedUsers = useMemo(() => {
    if (!users.length) return [];

    const searchLower = debouncedSearch.toLowerCase();
    
    const filtered = users.filter(user => 
      ['name', 'email', 'phone', 'userId'].some(field => 
        user[field]?.toString().toLowerCase().includes(searchLower)
      )
    );

    return filtered.sort((a, b) => {
      const aValue = a[orderBy]?.toString().toLowerCase() || "";
      const bValue = b[orderBy]?.toString().toLowerCase() || "";
      
      if (aValue < bValue) return order === "asc" ? -1 : 1;
      if (aValue > bValue) return order === "asc" ? 1 : -1;
      return 0;
    });
  }, [users, debouncedSearch, orderBy, order]);

  // Pagination
  const paginatedUsers = useMemo(() => {
    const startIndex = (page - 1) * ROWS_PER_PAGE;
    return filteredAndSortedUsers.slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [filteredAndSortedUsers, page]);

  const totalPages = Math.ceil(filteredAndSortedUsers.length / ROWS_PER_PAGE);

  // Event handlers
  const handleSort = useCallback((property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  }, [orderBy, order]);

  const handleExport = useCallback(() => {
    if (!filteredAndSortedUsers.length) return;

    const data = filteredAndSortedUsers.map(user => ({
      Name: user.name || "",
      Email: user.email || "",
      Phone: user.phone || "",
      "User ID": user.userId || "",
      Registered: user.createdAt ? new Date(user.createdAt).toLocaleString() : "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, `users_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  }, [filteredAndSortedUsers]);

  const toggleUserExpansion = useCallback(async (email) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(email)) {
        newSet.delete(email);
      } else {
        newSet.add(email);
        // Fetch orders if not already loaded
        if (!ordersMap.has(email)) {
          fetchUserOrders(email);
        }
      }
      return newSet;
    });
  }, [fetchUserOrders, ordersMap]);

  // Memoized table columns configuration
  const tableColumns = useMemo(() => [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "userId", label: "User ID" },
    { key: "createdAt", label: "Registered" },
  ], []);

  // User detail component to avoid repetition
  const UserDetails = React.memo(({ user }) => {
    const userOrders = ordersMap.get(user.email) || [];
    const isLoading = loadingStates.has(user.email);

    return (
      <Card sx={{ p: 2, bgcolor: "background.paper", mt: 1 }}>
        <Box display="flex" gap={3} flexWrap="wrap">
          {/* User Profile */}
          <Box sx={{ minWidth: 260, flex: 1 }}>
            <Typography variant="h6" gutterBottom>User Profile</Typography>
            <Typography><b>Name:</b> {user.name || "N/A"}</Typography>
            <Typography><b>Email:</b> {user.email || "N/A"}</Typography>
            <Typography><b>Phone:</b> {user.phone || "N/A"}</Typography>
            <Typography><b>User ID:</b> {user.userId || "N/A"}</Typography>
            <Typography><b>Registered:</b> {user.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A"}</Typography>
            
            {user.avatar && (
              <Box mt={1}>
                <img 
                  src={user.avatar} 
                  alt="avatar" 
                  style={{ 
                    maxWidth: 120, 
                    maxHeight: 120,
                    borderRadius: 8,
                    objectFit: 'cover'
                  }} 
                />
              </Box>
            )}
          </Box>

          {/* Cart & Wishlist */}
          <Box sx={{ minWidth: 300, flex: 1 }}>
            <Typography variant="h6" gutterBottom>Cart</Typography>
            {user.cart?.length ? (
              user.cart.slice(0, MAX_ORDERS_DISPLAY).map((item, idx) => (
                <Box key={`${item.productId}-${idx}`} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="body2"><b>Product ID:</b> {item.productId}</Typography>
                  <Typography variant="body2"><b>Qty:</b> {item.quantity}</Typography>
                  <Typography variant="body2"><b>Size:</b> {item.size || "N/A"}</Typography>
                  <Typography variant="body2"><b>Color:</b> {item.color || "N/A"}</Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2">No cart items</Typography>
            )}
            {user.cart?.length > MAX_ORDERS_DISPLAY && (
              <Typography variant="caption" color="text.secondary">
                +{user.cart.length - MAX_ORDERS_DISPLAY} more items
              </Typography>
            )}

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Wishlist</Typography>
            {user.wishlist?.length ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {user.wishlist.slice(0, 10).map((pid, i) => (
                  <Typography key={i} variant="body2" component="span">
                    {pid}{i < 9 ? ',' : ''}
                  </Typography>
                ))}
                {user.wishlist.length > 10 && (
                  <Typography variant="caption" color="text.secondary">
                    +{user.wishlist.length - 10} more
                  </Typography>
                )}
              </Box>
            ) : (
              <Typography variant="body2">No wishlist items</Typography>
            )}
          </Box>

          {/* Orders */}
          <Box sx={{ flex: 1, minWidth: 350 }}>
            <Typography variant="h6" gutterBottom>Orders</Typography>
            {isLoading ? (
              <Box display="flex" justifyContent="center">
                <CircularProgress size={20} />
              </Box>
            ) : userOrders.length ? (
              userOrders.slice(0, MAX_ORDERS_DISPLAY).map((order) => (
                <Paper key={order._id} sx={{ p: 1, mb: 1 }}>
                  <Typography variant="body2"><b>Order ID:</b> {order.razorpayOrderId || order._id}</Typography>
                  <Typography variant="body2"><b>Status:</b> {order.status}</Typography>
                  <Typography variant="body2"><b>Method:</b> {order.paymentMethod}</Typography>
                  <Typography variant="body2"><b>Total:</b> ₹{order.totalAmount?.toLocaleString()}</Typography>
                  <Typography variant="body2"><b>Placed:</b> {order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}</Typography>
                  
                  <Typography variant="body2" sx={{ mt: 1 }}><b>Items:</b></Typography>
                  <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {order.items?.map((item, i) => (
                      <li key={i}>
                        <Typography variant="body2">
                          {item.name} — Qty: {item.qty ?? item.quantity} — Size: {item.size || "N/A"} — ₹{item.price}
                        </Typography>
                      </li>
                    ))}
                  </Box>
                </Paper>
              ))
            ) : (
              <Typography variant="body2">No orders found</Typography>
            )}
            {userOrders.length > MAX_ORDERS_DISPLAY && (
              <Typography variant="caption" color="text.secondary">
                +{userOrders.length - MAX_ORDERS_DISPLAY} more orders
              </Typography>
            )}
          </Box>
        </Box>
      </Card>
    );
  });

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" flexWrap="wrap" alignItems="center" justifyContent="space-between" mb={3} gap={2}>
        <Typography variant="h5" sx={{ color: colors.primary, fontWeight: 700 }}>
          All Users ({filteredAndSortedUsers.length})
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 200 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleExport}
            sx={{ 
              textTransform: "none", 
              borderRadius: 2, 
              fontWeight: 600, 
              background: colors.primary 
            }}
            disabled={!filteredAndSortedUsers.length}
          >
            Export ({filteredAndSortedUsers.length})
          </Button>
        </Box>
      </Box>

      {/* Content */}
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Card sx={{ p: 2, bgcolor: "error.light" }}>
          <Typography color="error">{error}</Typography>
        </Card>
      ) : filteredAndSortedUsers.length === 0 ? (
        <Typography>No users found.</Typography>
      ) : (
        <>
          <TableContainer 
            component={Paper} 
            sx={{ 
              borderRadius: 2,
              maxHeight: '70vh',
              overflow: 'auto'
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell width="50px">
                    <b>Expand</b>
                  </TableCell>
                  {tableColumns.map((col) => (
                    <TableCell key={col.key}>
                      <TableSortLabel
                        active={orderBy === col.key}
                        direction={orderBy === col.key ? order : "asc"}
                        onClick={() => handleSort(col.key)}
                      >
                        <b>{col.label}</b>
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <React.Fragment key={user._id || user.email}>
                    <TableRow>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleUserExpansion(user.email)}
                        >
                          {expandedUsers.has(user.email) ? 
                            <KeyboardArrowUp /> : <KeyboardArrowDown />
                          }
                        </IconButton>
                      </TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.userId}</TableCell>
                      <TableCell>
                        {user.createdAt ? new Date(user.createdAt).toLocaleString() : ""}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={tableColumns.length + 1}>
                        <Collapse in={expandedUsers.has(user.email)} timeout="auto" unmountOnExit>
                          <UserDetails user={user} />
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default UsersList;