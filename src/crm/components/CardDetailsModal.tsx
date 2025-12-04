import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Stack,
  Chip,
  Divider,
  Avatar,
  Button,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import PriorityHighRoundedIcon from '@mui/icons-material/PriorityHighRounded';
import { Card as CardType } from '../types';

interface CardDetailsModalProps {
  open: boolean;
  card: CardType | null;
  onClose: () => void;
}

export default function CardDetailsModal({ open, card, onClose }: CardDetailsModalProps) {
  if (!card) return null;

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPriorityColor = (priority?: string): 'error' | 'warning' | 'default' => {
    switch (priority) {
      case 'alta':
        return 'error';
      case 'media':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Detalles de la Tarjeta
        </Typography>
        <Button
          onClick={onClose}
          sx={{
            minWidth: 'auto',
            p: 0.5,
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
            },
          }}
        >
          <CloseRoundedIcon />
        </Button>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* Título y Descripción */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              {card.title}
            </Typography>
            {card.description && (
              <Typography variant="body2" color="text.secondary">
                {card.description}
              </Typography>
            )}
          </Box>

          <Divider />

          {/* Persona Asignada */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
              PERSONA ASIGNADA
            </Typography>
            {card.assignee ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                  {card.assignee.substring(0, 2).toUpperCase()}
                </Avatar>
                <Typography variant="body2">{card.assignee}</Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Sin asignar
              </Typography>
            )}
          </Box>

          {/* Informador/Creador */}
          {card.createdBy && (
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                INFORMADOR
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem', bgcolor: 'primary.main' }}>
                  {card.createdBy.substring(0, 2).toUpperCase()}
                </Avatar>
                <Typography variant="body2">{card.createdBy}</Typography>
              </Box>
            </Box>
          )}

          {/* Fecha de Vencimiento */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
              FECHA DE VENCIMIENTO
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarTodayRoundedIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
              <Typography variant="body2">
                {card.dueDate ? formatDate(card.dueDate) : 'Por establecer'}
              </Typography>
            </Box>
          </Box>

          {/* Prioridad */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
              PRIORIDAD
            </Typography>
            {card.priority ? (
              <Chip
                label={card.priority.charAt(0).toUpperCase() + card.priority.slice(1)}
                color={getPriorityColor(card.priority)}
                variant="outlined"
                size="small"
              />
            ) : (
              <Typography variant="body2" color="text.secondary">
                No especificada
              </Typography>
            )}
          </Box>

          {/* Start Date */}
          {card.startDate && (
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                FECHA DE INICIO
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayRoundedIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                <Typography variant="body2">{formatDate(card.startDate)}</Typography>
              </Box>
            </Box>
          )}

          {/* Categoría */}
          {card.customer && (
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                CATEGORÍA
              </Typography>
              <Chip label={card.customer} size="small" variant="outlined" />
            </Box>
          )}

          {/* Presupuesto */}
          {card.value && (
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                PRESUPUESTO
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoneyRoundedIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatCurrency(card.value)}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Probabilidad */}
          {card.probability !== undefined && (
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                PROBABILIDAD
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PriorityHighRoundedIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                <Typography variant="body2">{card.probability}%</Typography>
              </Box>
            </Box>
          )}

          {/* Cierre Esperado */}
          {card.closingDate && (
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                CIERRE ESPERADO
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayRoundedIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                <Typography variant="body2">{formatDate(card.closingDate)}</Typography>
              </Box>
            </Box>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
