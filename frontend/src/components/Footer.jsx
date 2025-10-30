import React from "react";
import {
  Box,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
} from "@mui/material";
import { Facebook, Instagram, Twitter, YouTube } from "@mui/icons-material";
import colors from "../colors";
import logo from "../assets/SUMAN.png";

const socialIcons = [
  { icon: Facebook, label: "Facebook", url: "https://facebook.com" },
  {
    icon: Instagram,
    label: "Instagram",
    url: "https://www.instagram.com/sumansi.in?igsh=a3RvYnNub2dmeWNp&utm_source=qr",
  },
  { icon: Twitter, label: "Twitter", url: "https://twitter.com" },
  { icon: YouTube, label: "YouTube", url: "https://youtube.com" },
];

const navSections = [
  { title: "Shop", links: ["New Arrivals", "Our Collection"] },
  { title: "Support", links: ["Help", "Contact Us"] },
  { title: "Company", links: ["About Us", "Shipping Info", "Returns"] },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        background: colors.drawerBg,
        pt: { xs: 4, md: 6 },
        pb: 4,
        px: { xs: 3, sm: 5, md: 8 },
        borderTop: `1px solid ${colors.border}`,
        textAlign: "center", // Center all text content
      }}
    >
      <Grid container spacing={{ xs: 3, md: 5 }} justifyContent="center">
        {/* Brand Section with Logo */}
        <Grid item xs={12} md={4} lg={3}>
          <Box
            component="img"
            src={logo}
            alt="Suman Fashion Logo"
            sx={{
              height: { xs: 44, sm: 48, md: 56 },
              maxWidth: "100%",
              mb: 2,
              objectFit: "contain",
              display: "block",
              mx: "auto", // Center the logo
            }}
          />
          <Typography
            variant="body1"
            sx={{
              color: colors.icon,
              lineHeight: 1.6,
              fontSize: { xs: "1rem", sm: "1.1rem" },
              mb: 2,
              mx: "auto",
              maxWidth: "90%", // Ensure text doesn't stretch too wide
            }}
          >
            Your one-stop destination for{" "}
            <Box
              component="span"
              sx={{ color: colors.primary, fontWeight: 700 }}
            >
              trendsetting fashion
            </Box>{" "}
            that keeps you ahead of the curve and{" "}
            <Box
              component="span"
              sx={{ color: colors.primary, fontWeight: 700 }}
            >
              timeless styles
            </Box>{" "}
            that never go out of vogue — all curated to help you express your
            unique personality with confidence.
          </Typography>

          {/* Social Icons (Centered for All Views) */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              justifyContent: "center", // Center social icons
              mb: 1.5,
            }}
          >
            {socialIcons.map(({ icon: Icon, label, url }, idx) => (
              <IconButton
                key={idx}
                aria-label={`Visit our ${label} page`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: colors.primary,
                  backgroundColor: `${colors.primary}1A`,
                  "&:hover": {
                    backgroundColor: `${colors.primary}33`,
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                  p: { xs: 1, md: 0.75 },
                }}
              >
                <Icon fontSize="medium" />
              </IconButton>
            ))}
          </Box>
        </Grid>

        {/* Footer Navigation Links */}
        {navSections.map(({ title, links }) => (
          <Grid item xs={6} sm={4} md={2} key={title}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: colors.icon,
                fontSize: "1rem",
              }}
            >
              {title}
            </Typography>
            {links.map((text) => (
              <Link
                href={`/${text.toLowerCase().replace(/\s+/g, "-")}`}
                key={text}
                underline="none"
                sx={{
                  display: "block",
                  mb: 1,
                  color: colors.icon,
                  fontSize: "0.875rem",
                  "&:hover": {
                    color: colors.primary,
                    transform: "translateX(4px)",
                  },
                  transition: "all 0.2s ease",
                  textAlign: "center", // Center links
                }}
                aria-label={text}
              >
                {text}
              </Link>
            ))}
          </Grid>
        ))}
      </Grid>

      {/* Divider */}
      <Divider
        sx={{
          my: 3,
          borderColor: `${colors.primary}50`,
          width: "100%",
          mx: "auto",
        }}
      />

      {/* Bottom Bar */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between", // Center bottom bar content
          alignItems: "center",
          gap: 1.5,
          textAlign: "center",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: colors.icon,
            fontSize: "0.85rem",
          }}
        >
          © {currentYear} Suman. All rights reserved.
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            flexWrap: "wrap",
            justifyContent: "center", // Center policy links
          }}
        >
          {["Privacy Policy", "Terms of Service", "Cookies"].map((text) => (
            <Link
              key={text}
              href={`/${text.toLowerCase().replace(/\s+/g, "-")}`}
              underline="none"
              sx={{
                color: colors.icon,
                fontSize: "0.85rem",
                "&:hover": { color: colors.primary },
              }}
              aria-label={text}
            >
              {text}
            </Link>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;