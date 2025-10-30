import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
  Skeleton,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Announcement as AnnouncementIcon,
} from "@mui/icons-material";
import axios from "axios";
import colors from "../colors";
import { API_BASE_URL } from "../config";

const Announcements = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const [announcements, setAnnouncements] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
const API_URL = API_BASE_URL || "http://localhost:5000/api"; // Replace with your actual API base URL
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/announcements`);
      setAnnouncements(data);
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
      showSnackbar("Failed to fetch announcements", "error");
    } finally {
      setLoading(false);
    }
  };

  const addAnnouncement = async () => {
    if (!newAnnouncement.trim()) {
      showSnackbar("Announcement cannot be empty", "warning");
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/announcements`, { 
        text: newAnnouncement 
      });
      setAnnouncements(data);
      setNewAnnouncement("");
      showSnackbar("Announcement added successfully", "success");
    } catch (error) {
      console.error("Failed to add announcement:", error);
      showSnackbar("Failed to add announcement", "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteAnnouncement = async (id) => {
    setLoading(true);
    try {
      const { data } = await axios.delete(
        `${API_URL}/announcements/${id}`
      );
      setAnnouncements(data);
      showSnackbar("Announcement deleted", "success");
    } catch (error) {
      console.error("Failed to delete announcement:", error);
      showSnackbar("Failed to delete announcement", "error");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addAnnouncement();
    }
  };

  return (
    <Box sx={{ p: isMobile ? 2 : 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <AnnouncementIcon
          color="primary"
          sx={{ fontSize: 32, mr: 2, color: colors.primary }}
        />
        <Typography variant="h5" fontWeight="bold">
          Announcements
        </Typography>
      </Box>

      {/* Add Announcement Card */}
      <Card
        sx={{
          mb: 3,
          borderRadius: 2,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <CardContent>
          <Typography variant="subtitle1" gutterBottom fontWeight="medium">
            Create New Announcement
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: 2,
            }}
          >
            <TextField
              variant="outlined"
              placeholder="Type your announcement here..."
              value={newAnnouncement}
              onChange={(e) => setNewAnnouncement(e.target.value)}
              onKeyPress={handleKeyPress}
              fullWidth
              multiline
              rows={2}
              sx={{
                flexGrow: 1,
                color: colors.text,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "& fieldset": {
                    borderColor: colors.border,
                  },
                  "&:hover fieldset": {
                    borderColor: colors.primary,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: colors.primary,
                  },

                },
                
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={addAnnouncement}
              disabled={loading || !newAnnouncement.trim()}
              startIcon={<AddIcon />}
              sx={{
                borderRadius: 2,
                minWidth: isMobile ? "100%" : 120,
                padding: "5px 20px",
                textTransform: "none",
                fontWeight: "bold",
                backgroundColor: colors.primary,
              }}
            >
              {loading ? <CircularProgress size={24} /> : "Add"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}
      >
        <CardContent>
          <Typography variant="subtitle1" gutterBottom fontWeight="medium">
            Current Announcements ({announcements.length})
          </Typography>
          
          {loading && announcements.length === 0 ? (
            <Box display="flex" flexDirection="column" gap={2} py={4}>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={40} sx={{ borderRadius: 2 }} />
              ))}
              <CircularProgress sx={{ mt: 2 }} />
            </Box>
          ) : announcements.length === 0 ? (
            <Box
              sx={{
                py: 4,
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              <Typography>No announcements yet</Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {announcements.map((announcement, index) => (
                <React.Fragment key={announcement._id}>
                  <ListItem
                    sx={{
                      bgcolor: colors.drawerBg,
                      borderRadius: 2,
                      mb: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      transition: "0.2s",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: 1,
                      },
                    }}
                  >
                    <ListItemText
                      primary={announcement.text}
                      primaryTypographyProps={{
                        fontWeight: "medium",
                      }}
                      secondary={`Created: ${new Date(
                        announcement.createdAt
                      ).toLocaleString()}`}
                    />
                    <IconButton
                      color="error"
                      onClick={() => deleteAnnouncement(announcement._id)}
                      disabled={loading}
                      sx={{
                        ml: 2,
                        "&:hover": {
                          backgroundColor: "error.light",
                        },
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItem>
                  {index < announcements.length - 1 && (
                    <Divider sx={{ my: 1 }} />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Announcements;