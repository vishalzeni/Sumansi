import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  Fade,
  Slide,
  InputAdornment,
} from "@mui/material";
import {
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Security as SecurityIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import colors from "./colors"; // Adjust path

const AdminAuthDialog = ({ open, onSuccess }) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (input && error) setError("");
  }, [input, error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600)); // subtle delay
    const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || "";
    if (input === ADMIN_PASSWORD) {
      setError("");
      onSuccess();
    } else {
      setError("Incorrect password. Try again.");
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
    setIsSubmitting(false);
  };

  const handleTogglePassword = () => setShowPassword(!showPassword);

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      TransitionComponent={Slide}
      TransitionProps={{ direction: "down" }}
      PaperProps={{
        sx: {
          borderRadius: 4,
          bgcolor: colors.accent,
          minWidth: 450,
          maxWidth: 500,
          boxShadow: `0 25px 50px -12px rgba(0,0,0,0.25)`,
          border: `1px solid ${colors.border}20`,
          transform: shake ? "translateX(-8px)" : "none",
          transition: "transform 0.1s ease-in-out",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${colors.primary}15 0%, ${colors.primary}25 100%)`,
          borderBottom: `1px solid ${colors.border}30`,
          px: 3,
          py: 2,
          position: "relative",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              bgcolor: `${colors.primary}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${colors.primary}30`,
            }}
          >
            <SecurityIcon sx={{ color: colors.primary, fontSize: 24 }} />
          </Box>
          <Box>
            <DialogTitle
              sx={{
                color: colors.primary,
                fontWeight: 700,
                fontSize: "1.5rem",
                p: 0,
                lineHeight: 1.2,
              }}
            >
              Admin Authentication
            </DialogTitle>
            <Typography
              variant="body2"
              sx={{ color: colors.icon, opacity: 0.8, mt: 0.5 }}
            >
              Secure access required
            </Typography>
          </Box>
        </Box>
      </Box>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ px: 3, py: 3 }}>
          <Fade in timeout={600}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Typography
                variant="body1"
                sx={{
                  color: colors.icon,
                  textAlign: "center",
                  lineHeight: 1.6,
                }}
              >
                Enter your admin password to continue
              </Typography>

              <TextField
                label="Admin Password"
                type={showPassword ? "text" : "password"}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoFocus
                fullWidth
                required
                error={!!error}
                helperText={error}
                disabled={isSubmitting}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: colors.primary, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePassword}
                        edge="end"
                        size="small"
                        sx={{ color: colors.icon }}
                      >
                        {showPassword ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    bgcolor: colors.background,
                    borderRadius: 2,
                    fontSize: "1.1rem",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: colors.background,
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: colors.primary,
                      },
                    },
                    "&.Mui-focused": {
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: colors.primary,
                        borderWidth: "2px",
                      },
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: colors.icon,
                    fontSize: "1rem",
                    "&.Mui-focused": { color: colors.primary },
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: colors.border,
                    borderWidth: "1.5px",
                  },
                  "& .MuiFormHelperText-root": { fontSize: "0.875rem", mt: 1 },
                }}
              />
            </Box>
          </Fade>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", px: 3, pb: 3, pt: 1 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || !input.trim()}
            startIcon={!isSubmitting && <CheckIcon sx={{ fontSize: 20 }} />}
            sx={{
              bgcolor: colors.primary,
              color: colors.badgeText,
              minWidth: 160,
              height: 48,
              borderRadius: 3,
              fontSize: "1rem",
              fontWeight: 600,
              textTransform: "none",
              boxShadow: `0 4px 14px 0 ${colors.primary}40`,
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: colors.badge,
                transform: "translateY(-2px)",
              },
              "&:disabled": {
                bgcolor: `${colors.icon}30`,
                color: colors.icon,
                boxShadow: "none",
              },
            }}
          >
            {isSubmitting ? "Verifying..." : "Authenticate"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AdminAuthDialog;
