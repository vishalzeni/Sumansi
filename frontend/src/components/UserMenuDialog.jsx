import React from "react";
import { Box, Typography, Divider, Button } from "@mui/material";

const UserMenuDialog = ({ user, onLogout }) => (
  <Box sx={{ p: 2, minWidth: 220 }}>
    {user ? (
      <>
        <Typography variant="subtitle1" fontWeight={600}>
          {user.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user.email}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          User ID: {user.userId}
        </Typography>
        <Divider sx={{ my: 1 }} />
      </>
    ) : (
      <Typography variant="body2" color="text.secondary">
        Not logged in
      </Typography>
    )}
    <Button variant="outlined" color="error" fullWidth onClick={onLogout}>
      Logout
    </Button>
  </Box>
);

export default UserMenuDialog;
