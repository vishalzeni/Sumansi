// theme.js or wherever your theme is defined
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: `"Poppins", "Helvetica", "Arial", sans-serif`,
  },
  // Optional: customize typography variants
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: `"Poppins", "Helvetica", "Arial", sans-serif`,
        },
      },
    },
  },
});

export default theme;
