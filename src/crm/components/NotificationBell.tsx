import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import { useNotifications, Notification } from "../context/NotificationContext";

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Ahora";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return "Ayer";
  return `${diffDays}d`;
}

function getNotificationIcon(type: Notification["type"]) {
  const iconSx = { fontSize: 20 };
  switch (type) {
    case "success":
      return <CheckCircleRoundedIcon color="success" sx={iconSx} />;
    case "warning":
      return <WarningRoundedIcon color="warning" sx={iconSx} />;
    case "error":
      return <ErrorRoundedIcon color="error" sx={iconSx} />;
    default:
      return <InfoRoundedIcon color="info" sx={iconSx} />;
  }
}

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
    handleClose();
  };

  const handleViewAll = () => {
    handleClose();
    navigate("/notifications");
  };

  const open = Boolean(anchorEl);
  const recentNotifications = notifications.slice(0, 5);

  return (
    <>
      <IconButton
        aria-label="Abrir notificaciones"
        onClick={handleClick}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsRoundedIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            sx: { width: 360, maxHeight: 480 },
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              Notificaciones
            </Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                startIcon={<DoneAllRoundedIcon />}
                onClick={() => {
                  markAllAsRead();
                }}
              >
                Marcar leídas
              </Button>
            )}
          </Stack>
        </Box>

        <Divider />

        {recentNotifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <NotificationsRoundedIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
            <Typography color="text.secondary">No hay notificaciones</Typography>
          </Box>
        ) : (
          <List dense sx={{ py: 0 }}>
            {recentNotifications.map((notification) => (
              <ListItem
                key={notification.id}
                disablePadding
                sx={{
                  bgcolor: notification.read ? "transparent" : "action.hover",
                }}
              >
                <ListItemButton onClick={() => handleNotificationClick(notification)}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {getNotificationIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        fontWeight={notification.read ? 400 : 600}
                        noWrap
                      >
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {notification.body}
                      </Typography>
                    }
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    {formatTimeAgo(notification.createdAt)}
                  </Typography>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}

        <Divider />

        <Box sx={{ p: 1 }}>
          <Button fullWidth onClick={handleViewAll}>
            Ver todas las notificaciones
          </Button>
        </Box>
      </Popover>
    </>
  );
}
