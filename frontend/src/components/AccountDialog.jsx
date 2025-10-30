// AccountDialog.jsx (separate file)
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
  Typography,
  Box,
  Button,
} from "@mui/material";
import {
  Close as CloseIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  PermIdentity as PermIdentityIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import colors from "../colors";
import { API_BASE_URL } from "../config";

function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AccountDialog = ({
  open,
  onClose,
  user,
  onLogout,
  onSignup,
  onLogin,
  setUser,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    avatar: "",
  });
  const [saving, setSaving] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);

  // Fetch latest user from DB on dialog open
  useEffect(() => {
    const fetchUser = async () => {
      if (!user?.accessToken) return;
      setLoadingUser(true);
      try {
        const res = await fetch(`${API_BASE_URL}/user/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        });
        if (res.ok) {
          const freshUser = await res.json();
          // Merge accessToken into freshUser
          const userWithToken = { ...freshUser, accessToken: user.accessToken };
          if (typeof setUser === "function") {
            setUser(userWithToken);
            localStorage.setItem("user", JSON.stringify(userWithToken));
          }
          setEditForm({
            name: freshUser.name || "",
            phone: freshUser.phone || "",
            avatar: freshUser.avatar || "",
          });
        }
      } catch {}
      setLoadingUser(false);
    };
    if (open && user?.accessToken) fetchUser();
    setEditMode(false);
  }, [open]); // Only on open

  // Keep editForm in sync with user (for first render or after fetch)
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || "",
        phone: user.phone || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  // Handle profile pic upload (convert to base64)
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setEditForm((f) => ({ ...f, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const token = user.accessToken;
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.userId,
          name: editForm.name,
          phone: editForm.phone,
          avatar: editForm.avatar,
        }),
      });
      if (!response.ok) throw new Error("Failed to update profile");
      // After save, fetch latest user from DB
      const res2 = await fetch(`${API_BASE_URL}/user/profile`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res2.ok) {
        const freshUser = await res2.json();
        const userWithToken = { ...freshUser, accessToken: user.accessToken };
        if (typeof setUser === "function") {
          setUser(userWithToken);
          localStorage.setItem("user", JSON.stringify(userWithToken));
        }
      }
      setEditMode(false);
      onClose();
    } catch (err) {
      alert("Profile update failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          bgcolor: colors.cardBg,
          boxShadow: `0 8px 32px ${colors.primary}33`,
          p: 2,
          position: "relative",
        },
      }}
    >
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 12,
          top: 12,
          color: colors.primary,
          zIndex: 10,
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogTitle
        sx={{ textAlign: "center", color: colors.primary, fontWeight: 700 }}
      >
        {user ? "Account Info" : "Welcome"}
      </DialogTitle>
      <DialogContent sx={{ textAlign: "center" }}>
        {loadingUser ? (
          <Typography sx={{ color: colors.primary, my: 4 }}>Loading...</Typography>
        ) : user ? (
          <>
            <Box sx={{ position: "relative", mb: 2 }}>
              <Avatar
                src={editMode ? editForm.avatar : user.avatar}
                sx={{
                  bgcolor: colors.primary,
                  color: colors.badgeText,
                  fontWeight: 700,
                  width: 56,
                  height: 56,
                  fontSize: "1.5rem",
                  mx: "auto",
                  border: `2px solid ${colors.primary}`,
                  boxShadow: `0 2px 8px ${colors.primary}22`,
                }}
              >
                {!(editMode ? editForm.avatar : user.avatar) &&
                  getInitials(editMode ? editForm.name : user.name)}
              </Avatar>
              {editMode && (
                <Box sx={{ mt: 1 }}>
                  <input
                    accept="image/*"
                    type="file"
                    style={{ display: "none" }}
                    id="avatar-upload"
                    onChange={handleAvatarUpload}
                  />
                  <label htmlFor="avatar-upload">
                    <Button
                      variant="outlined"
                      size="small"
                      component="span"
                      sx={{
                        mt: 1,
                        fontSize: "0.85rem",
                        borderRadius: 2,
                        px: 2,
                        py: 0.5,
                        color: colors.primary,
                        borderColor: colors.primary,
                        "&:hover": { background: colors.accent },
                      }}
                    >
                      Upload Photo
                    </Button>
                  </label>
                </Box>
              )}
            </Box>
            {!editMode ? (
              <>
                <Box sx={{ textAlign: "left", mb: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: colors.primary, mb: 1 }}
                  >
                    {user.name}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <EmailIcon sx={{ color: colors.primary, fontSize: 18 }} />
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 500,
                          color: colors.icon,
                          lineHeight: 1,
                        }}
                      >
                        Email
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.icon }}>
                        {user.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <PhoneIcon sx={{ color: colors.primary, fontSize: 18 }} />
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 500,
                          color: colors.icon,
                          lineHeight: 1,
                        }}
                      >
                        Phone
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.icon }}>
                        {user.phone}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <PermIdentityIcon
                      sx={{ color: colors.primary, fontSize: 18 }}
                    />
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 500,
                          color: colors.icon,
                          lineHeight: 1,
                        }}
                      >
                        User ID
                      </Typography>
                      <Typography variant="body2" sx={{ color: colors.icon }}>
                        {user.userId}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </>
            ) : (
              <>
                <Box sx={{ mb: 2 }}>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, name: e.target.value }))
                    }
                    style={{
                      fontWeight: 600,
                      fontSize: "1.1rem",
                      color: colors.primary,
                      border: "1px solid " + colors.primary,
                      borderRadius: 4,
                      padding: "6px 10px",
                      marginBottom: 8,
                      width: "80%",
                      marginTop: 8,
                    }}
                    placeholder="Name"
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    style={{
                      fontWeight: 500,
                      fontSize: "1rem",
                      color: colors.primary,
                      border: "1px solid " + colors.primary,
                      borderRadius: 4,
                      padding: "6px 10px",
                      width: "80%",
                    }}
                    placeholder="Phone"
                  />
                </Box>
              </>
            )}
          </>
        ) : (
          <>
            <Typography sx={{ mb: 2, color: colors.icon }}>
              Please login or signup to access your account.
            </Typography>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        {user ? (
          !editMode ? (
            <>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                sx={{
                  color: colors.primary,
                  borderColor: colors.primary,
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 3,
                  "&:hover": { background: colors.accent },
                }}
                onClick={() => setEditMode(true)}
              >
                Edit
              </Button>
              <Button
                variant="contained"
                sx={{
                  background: colors.primary,
                  color: colors.badgeText,
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 4,
                  "&:hover": { background: "#a83200" },
                }}
                onClick={onLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                sx={{
                  color: colors.primary,
                  borderColor: colors.primary,
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 3,
                  "&:hover": { background: colors.accent },
                }}
                onClick={() => setEditMode(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                sx={{
                  background: colors.primary,
                  color: colors.badgeText,
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 4,
                  "&:hover": { background: "#a83200" },
                }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </>
          )
        ) : (
          <>
            <Button
              variant="contained"
              sx={{
                background: colors.primary,
                color: colors.badgeText,
                fontWeight: 700,
                borderRadius: 2,
                px: 3,
                mr: 1,
                "&:hover": { background: "#a83200" },
              }}
              onClick={onSignup}
            >
              Signup
            </Button>
            <Button
              variant="outlined"
              sx={{
                color: colors.primary,
                borderColor: colors.primary,
                fontWeight: 700,
                borderRadius: 2,
                px: 3,
                "&:hover": { background: colors.accent },
              }}
              onClick={onLogin}
            >
              Login
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AccountDialog;