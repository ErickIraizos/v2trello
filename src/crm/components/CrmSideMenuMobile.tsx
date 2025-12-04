import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import BusinessCenterRoundedIcon from "@mui/icons-material/BusinessCenterRounded";
import ContactsRoundedIcon from "@mui/icons-material/ContactsRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import { CrmLogo } from "./CrmAppNavbar";

const mainListItems = [
  { text: "Panel", icon: <DashboardRoundedIcon />, path: "/" },
  { text: "Usuarios", icon: <PeopleRoundedIcon />, path: "/users" },
  { text: "Tablas", icon: <BusinessCenterRoundedIcon />, path: "/tables" },
  { text: "Historial", icon: <ContactsRoundedIcon />, path: "/history" },
  { text: "Listas", icon: <AssignmentRoundedIcon />, path: "/lists" },
  { text: "Calendario", icon: <AssessmentRoundedIcon />, path: "/calendar" },
];

const secondaryListItems = [
  { text: "Configuración", icon: <SettingsRoundedIcon />, path: "/settings" },
  { text: "Ayuda y Soporte", icon: <HelpOutlineRoundedIcon />, path: "/help" },
];

interface CrmSideMenuMobileProps {
  open: boolean;
  toggleDrawer: (open: boolean) => () => void;
}

export default function CrmSideMenuMobile({
  open,
  toggleDrawer,
}: CrmSideMenuMobileProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    toggleDrawer(false)();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={toggleDrawer(false)}
      slotProps={{
        backdrop: { invisible: false },
      }}
      sx={{
        zIndex: 1300,
        "& .MuiDrawer-paper": {
          width: "280px",
          boxSizing: "border-box",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          mx: 2,
          my: 2,
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
          }}
        >
          <CrmLogo />
          <Typography variant="h6" component="div">
            Acme CRM
          </Typography>
        </Box>

        <List dense>
          {mainListItems.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 1 }} />

        <List dense>
          {secondaryListItems.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}
