import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import colors from '../colors'; // Adjust path to your colors file

const Loading = () => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black overlay
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999, // High z-index to ensure it’s on top
    }}
  >
    <CircularProgress
      sx={{
        color: colors.primary,
        size: 60,
      }}
    />
  </Box>
);

export default Loading;