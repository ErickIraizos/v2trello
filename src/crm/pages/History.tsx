import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  Avatar,
} from '@mui/material';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { useActivityLog } from '../hooks/useActivityLog';

const getActionColor = (action: string): 'primary' | 'success' | 'warning' | 'error' | 'info' => {
  switch (action) {
    case 'Crear':
      return 'success';
    case 'Editar':
      return 'info';
    case 'Eliminar':
      return 'error';
    case 'Ver':
      return 'primary';
    case 'Mover':
      return 'warning';
    default:
      return 'default';
  }
};

const getEntityIcon = (entity: string) => {
  switch (entity) {
    case 'Usuario':
      return <PersonRoundedIcon sx={{ fontSize: '1.25rem', color: 'white' }} />;
    case 'Tablero':
      return <GridViewRoundedIcon sx={{ fontSize: '1.25rem', color: 'white' }} />;
    case 'Tarjeta':
      return <CheckRoundedIcon sx={{ fontSize: '1.25rem', color: 'white' }} />;
    default:
      return <AddRoundedIcon sx={{ fontSize: '1.25rem', color: 'white' }} />;
  }
};

export default function History() {
  const { logs, clearLogs } = useActivityLog();

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Historial de Actividades
        </Typography>
        {logs.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteRoundedIcon />}
            onClick={() => {
              if (window.confirm('¿Desea limpiar todo el historial?')) {
                clearLogs();
              }
            }}
          >
            Limpiar Historial
          </Button>
        )}
      </Box>

      {logs.length === 0 ? (
        <Card variant="outlined">
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No hay actividades registradas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comienza creando usuarios, tableros o tarjetas para ver el historial
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {logs.map((log, index) => (
            <Card key={log.id} variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Avatar
                    sx={{
                      bgcolor: getActionColor(log.action),
                      flexShrink: 0,
                    }}
                  >
                    {getEntityIcon(log.entity)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={log.action}
                        size="small"
                        color={getActionColor(log.action)}
                        variant="outlined"
                      />
                      <Chip label={log.entity} size="small" variant="outlined" />
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                        {formatTime(log.timestamp)}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {log.action} {log.entity.toLowerCase()}: <strong>{log.entityName}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(log.timestamp)}
                    </Typography>
                    {log.details && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {Object.entries(log.details)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(' • ')}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}
