import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box"; // Added the missing import
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import BusinessCenterRoundedIcon from "@mui/icons-material/BusinessCenterRounded";
import ContactsRoundedIcon from "@mui/icons-material/ContactsRounded";
import AssignmentRoundedIcon from "@mui/icons-material/AssignmentRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";

const mainListItems = [
  { text: "Panel", icon: <DashboardRoundedIcon />, path: "/" },
  { text: "Usuarios", icon: <PeopleRoundedIcon />, path: "/users" },
  { text: "Tablas", icon: <BusinessCenterRoundedIcon />, path: "/tables" },
  { text: "Cronograma", icon: <TimelineRoundedIcon />, path: "/schedule" },
  { text: "Historial", icon: <ContactsRoundedIcon />, path: "/history" },
  { text: "Listas", icon: <AssignmentRoundedIcon />, path: "/lists" },
  { text: "Calendario", icon: <AssessmentRoundedIcon />, path: "/calendar" },
];

const secondaryListItems = [
  { text: "Notificaciones", icon: <NotificationsRoundedIcon />, path: "/notifications" },
  { text: "Ayuda y Soporte", icon: <HelpOutlineRoundedIcon />, path: "/help" },
];

export default function CrmMenuContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: "space-between" }}>
      <List dense>
        {mainListItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ display: "block" }}>
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
      <Box>
        <Divider sx={{ my: 1 }} />
        <List dense>
          {secondaryListItems.map((item, index) => (
            <ListItem key={index} disablePadding sx={{ display: "block" }}>
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
    </Stack>
  );
}
