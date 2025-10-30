import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, useMediaQuery } from "@mui/material";
import { useTokenTracker } from "./TokenTrackerProvider";
import colors from "./colors";
import { useTheme } from "@mui/material/styles";

const ExpiryDialog = () => {
  const { showDialog, refreshToken } = useTokenTracker();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // small screens

  return (
    <Dialog
      open={showDialog}
      disableEscapeKeyDown
      onClose={() => {}}
      fullWidth={isMobile}
      maxWidth="xs"
      PaperProps={{
        style: {
          backgroundColor: colors.accent,
          borderRadius: 30,
          padding: isMobile ? "0.7rem" : "1rem",
          minWidth: isMobile ? "auto" : 400,
          border: `2px solid ${colors.primary}`,
          boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
        },
      }}
    >
      <DialogTitle
        style={{
          color: colors.primary,
          fontWeight: 700,
          textAlign: "center",
          fontSize: isMobile ? "1.2rem" : "1.4rem",
        }}
      >
        Oops! Your session has expired 😢
      </DialogTitle>
      <DialogContent>
        <Typography
          style={{
            color: colors.icon,
            fontSize: isMobile ? "0.95rem" : "1rem",
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          Click below to continue your session and keep exploring.
        </Typography>
      </DialogContent>
      <DialogActions style={{ justifyContent: "center", paddingBottom: "1rem" }}>
        <Button
          onClick={refreshToken}
          variant="contained"
          style={{
            backgroundColor: colors.primary,
            color: colors.badgeText,
            padding: isMobile ? "0.6rem 1rem" : "0.6rem 2rem",
            borderRadius: 12,
            fontWeight: 600,
            fontSize: isMobile ? "0.9rem" : "0.95rem",
            textTransform: "none",
            width: isMobile ? "100%" : "auto",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#D03500")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = colors.primary)}
        >
          Continue Session 🤍
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpiryDialog;
