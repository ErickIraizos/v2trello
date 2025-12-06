import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useNotifications, Notification } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";

function formatTimeAgo(dateInput: string | Date): string {
  const now = new Date();
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Ahora";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays === 1) return "Ayer";
  return `Hace ${diffDays} días`;
}

function getNotificationIcon(type: Notification["type"]) {
  switch (type) {
    case "success":
      return <CheckCircleRoundedIcon color="success" />;
    case "warning":
      return <WarningRoundedIcon color="warning" />;
    case "error":
      return <ErrorRoundedIcon color="error" />;
    default:
      return <InfoRoundedIcon color="info" />;
  }
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onNavigate,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate: (link: string) => void;
}) {
  return (
    <Card
      sx={{
        mb: 2,
        bgcolor: notification.read ? "transparent" : "action.hover",
        cursor: notification.link ? "pointer" : "default",
        transition: "all 0.2s",
        "&:hover": {
          bgcolor: "action.selected",
        },
      }}
      onClick={() => {
        if (!notification.read) onMarkAsRead(notification.id);
        if (notification.link) onNavigate(notification.link);
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box sx={{ pt: 0.5 }}>{getNotificationIcon(notification.type)}</Box>
          <Box sx={{ flexGrow: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" fontWeight={notification.read ? 400 : 600}>
                {notification.title}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  {formatTimeAgo(notification.createdAt)}
                </Typography>
                {!notification.read && (
                  <Chip label="Nueva" size="small" color="primary" sx={{ height: 20 }} />
                )}
              </Stack>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {notification.body}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
          >
            <DeleteRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll, addNotification } =
    useNotifications();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: "",
    body: "",
    type: "info" as Notification["type"],
    link: "",
  });

  const filteredNotifications =
    tabValue === 0 ? notifications : notifications.filter((n) => !n.read);

  const handleCreateNotification = () => {
    if (!newNotification.title || !newNotification.body) return;
    
    addNotification({
      title: newNotification.title,
      body: newNotification.body,
      type: newNotification.type,
      link: newNotification.link || undefined,
    });
    
    setNewNotification({ title: "", body: "", type: "info", link: "" });
    setDialogOpen(false);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <NotificationsRoundedIcon sx={{ fontSize: 32 }} color="primary" />
          <Typography component="h1" variant="h4" fontWeight="bold">
            Notificaciones
          </Typography>
          {unreadCount > 0 && (
            <Chip label={`${unreadCount} sin leer`} color="primary" size="small" />
          )}
        </Stack>
        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Nueva Notificación
        </Button>
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label={`Todas (${notifications.length})`} />
          <Tab label={`Sin leer (${unreadCount})`} />
        </Tabs>
        <Stack direction="row" spacing={1}>
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<DoneAllRoundedIcon />}
              onClick={markAllAsRead}
            >
              Marcar todas como leídas
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="outlined"
              size="small"
              color="error"
              startIcon={<DeleteRoundedIcon />}
              onClick={clearAll}
            >
              Eliminar todas
            </Button>
          )}
        </Stack>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent>
            <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
              <NotificationsRoundedIcon sx={{ fontSize: 64, color: "text.disabled" }} />
              <Typography variant="h6" color="text.secondary">
                {tabValue === 0 ? "No hay notificaciones" : "No hay notificaciones sin leer"}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        filteredNotifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
            onNavigate={navigate}
          />
        ))
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Crear Nueva Notificación</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Título"
              fullWidth
              value={newNotification.title}
              onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
              autoFocus
            />
            <TextField
              label="Mensaje"
              fullWidth
              multiline
              rows={3}
              value={newNotification.body}
              onChange={(e) => setNewNotification({ ...newNotification, body: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={newNotification.type}
                label="Tipo"
                onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value as Notification["type"] })}
              >
                <MenuItem value="info">Información</MenuItem>
                <MenuItem value="success">Éxito</MenuItem>
                <MenuItem value="warning">Advertencia</MenuItem>
                <MenuItem value="error">Error</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Enlace (opcional)"
              fullWidth
              placeholder="/lists, /calendar, etc."
              value={newNotification.link}
              onChange={(e) => setNewNotification({ ...newNotification, link: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateNotification}
            disabled={!newNotification.title || !newNotification.body}
          >
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
