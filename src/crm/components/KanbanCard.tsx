import React from 'react';
import { Card as MuiCard, CardContent, Typography, Box, Chip, Stack, Avatar } from '@mui/material';
import { Card as CardType } from '../types';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';

interface KanbanCardProps {
  card: CardType;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, cardId: string) => void;
}

export default function KanbanCard({ card, isDragging, onDragStart }: KanbanCardProps) {
  const formatCurrency = (value?: number) => {
    if (!value) return '';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getPriorityColor = (priority?: string): any => {
    switch (priority) {
      case 'alta':
        return 'error';
      case 'media':
        return 'warning';
      case 'baja':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <MuiCard
      draggable
      onDragStart={(e) => onDragStart?.(e, card.id)}
      sx={{
        mb: 1.5,
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        '&:active': {
          cursor: 'grabbing',
        },
        '&:hover': {
          boxShadow: 2,
        },
        transition: 'all 0.2s ease',
      }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          {card.title}
        </Typography>
        {card.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {card.description}
          </Typography>
        )}
        <Stack spacing={1}>
          {card.customer && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                {card.customer}
              </Typography>
              {card.value && (
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {formatCurrency(card.value)}
                </Typography>
              )}
            </Box>
          )}
          {card.priority && (
            <Chip
              label={card.priority}
              size="small"
              color={getPriorityColor(card.priority)}
              variant="outlined"
              sx={{ width: 'fit-content', height: 20 }}
            />
          )}
          {card.probability !== undefined && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                Probabilidad
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {card.probability}%
              </Typography>
            </Box>
          )}
          {(card.startDate || card.dueDate) && (
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
              {card.startDate && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarTodayRoundedIcon sx={{ fontSize: '0.875rem', color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(card.startDate)}
                  </Typography>
                </Box>
              )}
              {card.dueDate && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarTodayRoundedIcon
                    sx={{
                      fontSize: '0.875rem',
                      color: isOverdue(card.dueDate) ? 'error.main' : 'text.secondary',
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: isOverdue(card.dueDate) ? 'error.main' : 'text.secondary', fontWeight: 500 }}
                  >
                    {formatDate(card.dueDate)}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
          {card.createdBy && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              <Avatar
                sx={{
                  width: 20,
                  height: 20,
                  fontSize: '0.65rem',
                  bgcolor: 'primary.main',
                }}
              >
                {card.createdBy.substring(0, 2).toUpperCase()}
              </Avatar>
              <Typography variant="caption" color="text.secondary">
                {card.createdBy}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </MuiCard>
  );
}
