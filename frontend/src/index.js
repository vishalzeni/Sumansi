import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme"; // adjust path if needed
import { CartProvider } from "./hooks/useCart";
ReactDOM.createRoot(document.getElementById("root")).render(
    <ThemeProvider theme={theme}>
      <CartProvider>
        <CssBaseline />
        <App />
      </CartProvider>
    </ThemeProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
