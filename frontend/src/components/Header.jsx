import React, { useState, useContext } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import colors from "../colors";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Button,
  Badge,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemText,
  styled,
  useMediaQuery,
  useTheme,
  Divider,
  Link,
  Tooltip,
  Avatar,
  ListItemButton,
} from "@mui/material";
import {
  FavoriteBorder as FavoriteBorderIcon,
  ShoppingCart as ShoppingCartIcon,
  AccountCircle as AccountCircleIcon,
  Menu as MenuIcon,
  ChevronRightOutlined,
  Close as CloseIcon,
} from "@mui/icons-material";
import logo from "../assets/SUMAN.png";
import { useCart } from "../hooks/useCart";
import AccountDialog from "./AccountDialog";
import CartSidebar from "./CartSidebar";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: colors.background,
  boxShadow: "0 2px 4px rgba(122, 78, 171, 0.1)",
  position: "sticky",
  top: 0,
  zIndex: theme.zIndex.appBar,
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: colors.icon,
  fontWeight: 600,
  letterSpacing: 1,
  fontSize: "0.75rem",
  textTransform: "uppercase",
  minWidth: "unset",
  padding: theme.spacing(1, 1.5),
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    width: "100%",
    height: "2px",
    bottom: 0,
    left: 0,
    backgroundColor: colors.primary,
    transform: "scaleX(0)",
    transformOrigin: "left",
    transition: "transform 250ms ease-in-out",
    borderRadius: "1px",
  },
  "&:hover": {
    backgroundColor: "transparent",
    color: colors.primary,
    "&::after": {
      transform: "scaleX(1)",
    },
  },
  [theme.breakpoints.up("md")]: {
    fontSize: "0.875rem",
    padding: theme.spacing(1, 2),
  },
  [`@media (max-width:1400px)`]: {
    fontSize: "0.8rem",
    padding: theme.spacing(0.5, 1.2),
  },
  [`@media (max-width:1200px)`]: {
    fontSize: "0.75rem",
    padding: theme.spacing(0.5, 1),
  },
}));

const IconWrapper = styled(IconButton)(({ theme }) => ({
  color: colors.icon,
  padding: theme.spacing(1),
  transition: "color 0.3s ease",
  "&:hover": {
    color: colors.primary,
    backgroundColor: "transparent",
  },
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(1, 1.5),
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: colors.primary,
    color: colors.badgeText,
    fontWeight: 700,
    fontSize: "0.75rem",
    minWidth: "20px",
    height: "20px",
    borderRadius: "10px",
    padding: "0 6px",
    boxShadow: `0 2px 4px ${colors.primary}33`,
  },
}));

function getInitials(name) {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { user, handleLogout, setUser } = useContext(UserContext);
  const { cartItems, loading } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  const toggleDrawer = (open) => () => setDrawerOpen(open);

  const handleAvatarClick = () => setDialogOpen(true);

  const handleLogoutClick = () => {
    handleLogout();
    setDialogOpen(false);
  };

  const handleSignup = () => {
    navigate("/signup");
    setDialogOpen(false);
  };

  const handleLogin = () => {
    navigate("/login");
    setDialogOpen(false);
  };

  const handleDrawerAvatarClick = () => {
    setDialogOpen(true);
    setDrawerOpen(false);
  };

  const navItems = [
    { label: "Home", path: "/" },
    {
      label: "New Arrivals",
      path: "/new-arrivals",
    },
    { label: "Our Collection", path: "/our-collection" },
    { label: "About", path: "/about" },
    { label: "Contact Us", path: "/contact" },
  ];

  return (
    <>
      <StyledAppBar>
        <Toolbar
          sx={{
            position: "relative",
            justifyContent: "space-between",
            alignItems: "center",
            px: { xs: 1, sm: 2, md: 4 },
            minHeight: {
              xs: "60px",
              sm: "64px",
              md: "72px",
            },
          }}
        >
          {/* Left: Nav or Hamburger */}
          <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
            {isTablet || isMobile ? (
              <Tooltip title="Open menu" arrow>
                <IconWrapper onClick={toggleDrawer(true)} aria-label="menu">
                  <MenuIcon />
                </IconWrapper>
              </Tooltip>
            ) : (
              <Box sx={{ display: "flex", gap: { xs: 0.5, md: 1 } }}>
                {navItems.slice(0, 3).map(({ label, path, onClick }, idx) => (
                  <NavButton
                    component={RouterLink}
                    to={path}
                    onClick={onClick}
                    key={label || idx}
                  >
                    {label}
                  </NavButton>
                ))}
              </Box>
            )}
          </Box>

          {/* Center: Logo */}
          <Box
            sx={{
              position: isMobile || isTablet ? "absolute" : "static",
              left: isMobile || isTablet ? "50%" : "auto",
              transform: isMobile || isTablet ? "translateX(-50%)" : "none",
              textAlign: "center",
              flexGrow: isMobile ? 1 : 0,
            }}
          >
            <Link component={RouterLink} to="/">
              <Box
                component="img"
                src={logo}
                alt="Logo"
                sx={{
                  height: {
                    xs: 56,
                    sm: 60,
                    md: 62,
                    lg: 70,
                  },
                  mixBlendMode: "multiply",
                  objectFit: "contain",
                  maxWidth: {
                    xs: "160px",
                    sm: "180px",
                    md: "200px",
                  },
                }}
              />
            </Link>
          </Box>

          {/* Right Side: Remaining Buttons + Icons */}
          <Box
            sx={{
              display: "flex",
              gap: { xs: 0.5, md: 1 },
              alignItems: "center",
              justifyContent: "flex-end",
              flex: 1,
            }}
          >
            {!isMobile &&
              navItems.slice(3).map(({ label, path }, idx) => (
                <NavButton component={RouterLink} to={path} key={label || idx}>
                  {label}
                </NavButton>
              ))}
            {!isMobile &&
              (user ? (
                <Tooltip title={user.name} arrow>
                  <Avatar
                    src={user.avatar}
                    sx={{
                      bgcolor: colors.primary,
                      color: colors.badgeText,
                      fontWeight: 700,
                      width: 36,
                      height: 36,
                      fontSize: "1.1rem",
                      cursor: "pointer",
                      border: `2px solid ${colors.primary}`,
                      boxShadow: `0 2px 8px ${colors.primary}22`,
                    }}
                    onClick={handleAvatarClick}
                  >
                    {!user.avatar && getInitials(user.name)}
                  </Avatar>
                </Tooltip>
              ) : (
                <Tooltip title="Account" arrow>
                  <IconWrapper aria-label="account" onClick={handleAvatarClick}>
                    <AccountCircleIcon />
                  </IconWrapper>
                </Tooltip>
              ))}
            <Tooltip title="Wishlist" arrow>
              <Link
                component={RouterLink}
                to="/wishlist"
                underline="none"
                color="inherit"
              >
                <IconWrapper aria-label="wishlist">
                  <FavoriteBorderIcon />
                </IconWrapper>
              </Link>
            </Tooltip>
            <Tooltip title="Cart" arrow>
              <Box sx={{ ml: 1 }}>
                {loading ? (
                  <IconWrapper disabled>
                    <StyledBadge badgeContent={0}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          border: "2px solid",
                          borderColor: `${colors.primary}44`,
                          borderTopColor: colors.primary,
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                    </StyledBadge>
                  </IconWrapper>
                ) : (
                  <IconButton
                    aria-label="cart"
                    onClick={() => setCartOpen(true)}
                    sx={{ color: colors.icon }}
                  >
                    <StyledBadge badgeContent={cartItems.length}>
                      <ShoppingCartIcon />
                    </StyledBadge>
                  </IconButton>
                )}
              </Box>
            </Tooltip>
          </Box>
        </Toolbar>
      </StyledAppBar>

      {/* Drawer for mobile */}
      <SwipeableDrawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
      >
        <Box
          sx={{
            width: 260,
            backgroundColor: colors.drawerBg,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
          role="presentation"
        >
          <Box>
            {/* Drawer Top Logo + Close */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                px: 1,
                py: 1.5,
                backgroundColor: colors.accent,
              }}
            >
              <Link component={RouterLink} to="/" onClick={toggleDrawer(false)}>
                <Box
                  component="img"
                  src={logo}
                  alt="Logo"
                  sx={{
                    objectFit: "contain",
                    maxWidth: "120px",
                  }}
                />
              </Link>
              <IconButton onClick={toggleDrawer(false)}>
                <Tooltip title="Close menu" arrow>
                  <CloseIcon sx={{ color: colors.primary }} />
                </Tooltip>
              </IconButton>
            </Box>

            <Divider />

            {/* Drawer Nav Links */}
            <List disablePadding>
              {navItems.map(({ label, path, onClick }) => (
                <Tooltip title={label} arrow key={label}>
                  <ListItem disablePadding key={label}>
                    <Tooltip title={label} arrow>
                      <ListItemButton
                        component={RouterLink}
                        to={path}
                        onClick={(e) => {
                          setDrawerOpen(false);
                          if (onClick) onClick(e);
                        }}
                        sx={{
                          borderTop: `1px solid ${colors.border}`,
                          borderBottom: `1px solid ${colors.border}`,
                          px: 2,
                          py: 1.2,
                          transition: "all 0.3s ease",
                          "&:hover .arrow-icon": {
                            transform: "translateX(6px)",
                            opacity: 1,
                          },
                        }}
                      >
                        <ListItemText
                          primary={label}
                          primaryTypographyProps={{
                            fontWeight: 400,
                            color: colors.primary,
                          }}
                        />
                        <ChevronRightOutlined
                          className="arrow-icon"
                          sx={{
                            ml: 1,
                            fontSize: 20,
                            transition: "all 0.3s ease",
                            transform: "translateX(0)",
                            opacity: 0.7,
                            color: colors.primary,
                          }}
                        />
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>
                </Tooltip>
              ))}
            </List>
          </Box>

          {/* Bottom Account Shortcut */}
          <Box sx={{ borderTop: `1px solid ${colors.border}` }}>
            <List disablePadding>
              {user ? (
                <ListItem
                  button
                  onClick={handleDrawerAvatarClick}
                  sx={{
                    py: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Avatar
                    src={user.avatar}
                    sx={{
                      bgcolor: colors.primary,
                      color: colors.badgeText,
                      fontWeight: 700,
                      width: 36,
                      height: 36,
                      fontSize: "1.1rem",
                      border: `2px solid ${colors.primary}`,
                      boxShadow: `0 2px 8px ${colors.primary}22`,
                    }}
                  >
                    {!user.avatar && getInitials(user.name)}
                  </Avatar>
                  <ListItemText
                    primary={user.name}
                    primaryTypographyProps={{
                      fontWeight: 600,
                      color: colors.primary,
                    }}
                  />
                </ListItem>
              ) : (
                <ListItem
                  button
                  component={RouterLink}
                  to="/signup"
                  onClick={toggleDrawer(false)}
                >
                  <Tooltip title="Go to Account" arrow>
                    <AccountCircleIcon sx={{ color: colors.primary, mr: 1 }} />
                  </Tooltip>
                  <ListItemText
                    primary="My Account"
                    primaryTypographyProps={{
                      fontWeight: 500,
                      color: colors.primary,
                    }}
                  />
                </ListItem>
              )}
            </List>
          </Box>
        </Box>
      </SwipeableDrawer>

      <AccountDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        user={user}
        onLogout={handleLogoutClick}
        onSignup={handleSignup}
        onLogin={handleLogin}
        setUser={setUser}
      />
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

export default Header;
