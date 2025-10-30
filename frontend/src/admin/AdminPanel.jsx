import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Divider,
  Tooltip,
  AppBar,
  Toolbar,
  useMediaQuery,
  useTheme,
  Button,
  Avatar,
  Badge,
} from "@mui/material";
import { Dashboard } from "@mui/icons-material";
import {
  AddCircleOutline,
  Inventory as InventoryIcon,
  Menu,
  Close,
  Campaign as CampaignIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
} from "@mui/icons-material";

import StorefrontIcon from "@mui/icons-material/Storefront";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import OrdersList from "./OrdersList";
import colors from "../colors";
import AddProduct from "./AddProduct";
import Inventory from "./Inventory";
import Announcements from "./Announcements";
import UsersList from "./UsersList";
import BannerList from "./BannerList";
import AdminAuthDialog from "../AdminAuthDialog";
import { useNavigate } from "react-router-dom";


const sidebarItems = [
  { text: "Add Product", icon: <AddCircleOutline /> },
  { text: "Inventory", icon: <InventoryIcon /> },
  { text: "Announcements", icon: <CampaignIcon /> },
  { text: "Users", icon: <Dashboard /> },
  { text: "Banners", icon: <StorefrontIcon /> },
  { text: "Orders", icon: <ShoppingCartIcon /> },
];

const AdminPanel = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sidebarOpen")) ?? true;
    } catch {
      return true;
    }
  });
  const [selected, setSelected] = useState(0);
  const [auth, setAuth] = useState(false);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      const newState = !desktopOpen;
      setDesktopOpen(newState);
      localStorage.setItem("sidebarOpen", JSON.stringify(newState));
    }
  };

  if (!auth) {
    return <AdminAuthDialog open={!auth} onSuccess={() => setAuth(true)} />;
  }

  const sidebarContent = (
    <Box
      sx={{
        p: 2,
        bgcolor: colors.drawerBg,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        ...(!desktopOpen &&
          !isMobile && {
            alignItems: "center",
            justifyContent: "flex-start",
          }),
      }}
    >
      {/* Admin Profile Section - Only when expanded */}
      {(desktopOpen || isMobile) && (
        <Box
          sx={{
            p: 2,
            mb: 2,
            bgcolor: `${colors.primary}08`,
            borderRadius: 2,
            border: `1px solid ${colors.border}`,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: colors.primary,
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            <AdminIcon />
          </Avatar>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: colors.primary,
                fontSize: "0.9rem",
              }}
            >
              Admin User
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: colors.icon,
                fontSize: "0.75rem",
              }}
            >
              Administrator
            </Typography>
          </Box>
        </Box>
      )}

      {/* Header (Mobile Close Button) */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: isMobile ? "space-between" : "center",
        }}
      >
        {isMobile && (
          <Typography
            variant="h6"
            sx={{
              color: colors.primary,
              fontWeight: 600,
            }}
          >
            Menu
          </Typography>
        )}
        {isMobile && (
          <IconButton
            onClick={() => setMobileOpen(false)}
            sx={{
              color: colors.icon,
              "&:hover": { bgcolor: `${colors.primary}15` },
            }}
          >
            <Close />
          </IconButton>
        )}
      </Box>
      {isMobile && <Divider sx={{ my: 1.5, borderColor: colors.border }} />}

      {/* Sidebar Items */}
      <Box
        sx={{
          width: "100%",
          flex: 1,
          ...(!desktopOpen &&
            !isMobile && {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }),
        }}
      >
        <List
          sx={{
            p: 0,
            ...(!desktopOpen &&
              !isMobile && {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }),
          }}
        >
          {sidebarItems.map((item, index) => {
            const isSelected = selected === index;
            return (
              <React.Fragment key={item.text}>
                <Tooltip
                  title={!desktopOpen && !isMobile ? item.text : ""}
                  placement="right"
                  arrow
                >
                  <ListItem
                    button
                    selected={isSelected}
                    onClick={() => {
                      setSelected(index);
                      if (isMobile) setMobileOpen(false);
                    }}
                    sx={{
                      position: "relative",
                      borderRadius: 2,
                      mb: 0.5,
                      backgroundColor: isSelected
                        ? colors.primary
                        : "transparent",
                      color: isSelected ? colors.badgeText : colors.icon,
                      transition: "all 0.2s ease",
                      "&.Mui-selected": {
                        backgroundColor: colors.primary,
                        color: colors.badgeText,
                        "&:hover": {
                          backgroundColor: colors.primary,
                        },
                      },
                      "&:hover": {
                        backgroundColor: !isSelected
                          ? `${colors.primary}12`
                          : colors.primary,
                      },
                      justifyContent:
                        desktopOpen || isMobile ? "flex-start" : "center",
                      ...(!desktopOpen &&
                        !isMobile && {
                          width: 48,
                          height: 48,
                          mx: "auto",
                          mb: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          p: 0,
                        }),
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: isSelected ? colors.badgeText : colors.icon,
                        minWidth: desktopOpen || isMobile ? 40 : "auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {(desktopOpen || isMobile) && (
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontWeight: isSelected ? 600 : 500,
                          fontSize: "0.9rem",
                        }}
                      />
                    )}
                  </ListItem>
                </Tooltip>

                {/* Divider between items */}
                {index < sidebarItems.length - 1 && (
                  <Divider
                    sx={{
                      my: 0.5,
                      borderColor: colors.border,
                      opacity: 0.5,
                      width: desktopOpen || isMobile ? "85%" : "50%",
                      mx: "auto",
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Clean Header */}
      <AppBar
        position="fixed"
        sx={{
          background: colors.primary,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          zIndex: 1200,
        }}
      >
        <Toolbar
          sx={{
            minHeight: 64,
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* Left Menu Button */}
          <Box sx={{ display: "flex", alignItems: "center", minWidth: 48 }}>
            <Tooltip title="Toggle Menu" arrow>
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{
                  color: colors.background,
                  "&:hover": { bgcolor: `${colors.background}15` },
                }}
              >
                <Menu />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Title */}
          <Typography
            variant="h6"
            sx={{
              flex: 1,
              textAlign: "center",
              fontWeight: 600,
              color: colors.background,
              fontSize: "1.1rem",
            }}
          >
            Admin Panel
          </Typography>

          {/* Right Logout Button */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              minWidth: 48,
              justifyContent: "flex-end",
            }}
          >
            <Tooltip title="Logout" arrow>
              <IconButton
                onClick={() => {
                  setAuth(false);
                  navigate("/");
                }}
                sx={{
                  color: colors.background,
                  "&:hover": { bgcolor: `${colors.background}15` },
                }}
              >
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Layout */}
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          bgcolor: colors.background,
        }}
      >
        {/* Sidebar */}
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : desktopOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            width: desktopOpen || isMobile ? 260 : 72,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: desktopOpen || isMobile ? 260 : 72,
              boxSizing: "border-box",
              bgcolor: colors.drawerBg,
              borderRight: `1px solid ${colors.border}`,
              transition: "width 0.3s ease",
              top: isMobile ? 0 : 64,
              height: isMobile ? "100%" : "calc(100% - 64px)",
              overflowX: "hidden",
            },
          }}
        >
          {sidebarContent}
        </Drawer>

        {/* Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mt: 8,
            bgcolor: colors.background,
            minHeight: "calc(100vh - 64px)",
          }}
        >
          <Box
            sx={{
              minHeight: "calc(100vh - 140px)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            {selected === 0 ? (
              <AddProduct />
            ) : selected === 1 ? (
              <Inventory />
            ) : selected === 2 ? (
              <Announcements />
            ) : selected === 3 ? (
              <UsersList />
            ) : selected === 4 ? (
              <BannerList />
            ) : selected === 5 ? (
              <OrdersList />
            ) : (
              <Box
                sx={{
                  height: "60vh",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  color: colors.icon,
                  textAlign: "center",
                }}
              >
                <AdminIcon sx={{ fontSize: 64, opacity: 0.4 }} />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 500,
                    opacity: 0.7,
                    color: colors.primary,
                  }}
                >
                  Welcome to Admin Panel
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    opacity: 0.6,
                    maxWidth: 400,
                  }}
                >
                  Select an option from the sidebar to manage your application.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default AdminPanel;
