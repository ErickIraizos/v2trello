import React from 'react';
import { Box, Paper, Typography, Stack, IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import { Column, Card as CardType } from '../types';
import KanbanCard from './KanbanCard';
import CardDetailsModal from './CardDetailsModal';

interface KanbanColumnProps {
  column: Column;
  cards: CardType[];
  isOverColumn?: boolean;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>, columnId: string) => void;
  onCardDragStart?: (e: React.DragEvent<HTMLDivElement>, cardId: string) => void;
  onCardEdit?: (cardId: string) => void;
  onCardDelete?: (cardId: string) => void;
  draggedCardId?: string;
  cardsMap?: Record<string, CardType>;
}

export default function KanbanColumn({
  column,
  cards,
  isOverColumn,
  onDragOver,
  onDragLeave,
  onDrop,
  onCardDragStart,
  onCardEdit,
  onCardDelete,
  draggedCardId,
  cardsMap,
}: KanbanColumnProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [menuCardId, setMenuCardId] = React.useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState<CardType | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, cardId: string) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuCardId(cardId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuCardId(null);
  };

  const handleShowDetails = () => {
    if (menuCardId && cardsMap) {
      setSelectedCard(cardsMap[menuCardId] || null);
      setDetailsModalOpen(true);
    }
    handleMenuClose();
  };

  return (
    <Paper
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop?.(e, column.id)}
      sx={{
        flex: '0 0 300px',
        minHeight: '500px',
        p: 2,
        backgroundColor: isOverColumn ? 'action.hover' : 'background.paper',
        border: isOverColumn ? '2px dashed' : '1px solid',
        borderColor: isOverColumn ? 'primary.main' : 'divider',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {column.title}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            backgroundColor: 'action.hover',
            px: 1,
            py: 0.5,
            borderRadius: '12px',
            fontWeight: 600,
          }}
        >
          {column.cardIds.length}
        </Typography>
      </Box>
      <Stack sx={{ flex: 1, overflowY: 'auto' }}>
        {cards.map((card) => (
          <Box
            key={card.id}
            sx={{
              position: 'relative',
              '&:hover .card-menu-button': {
                opacity: 1,
              },
            }}
          >
            <KanbanCard
              card={card}
              isDragging={draggedCardId === card.id}
              onDragStart={onCardDragStart}
            />
            <IconButton
              className="card-menu-button"
              size="small"
              onClick={(e) => handleMenuOpen(e, card.id)}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                opacity: 0,
                transition: 'opacity 0.2s',
              }}
            >
              <MoreVertRoundedIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Box>
        ))}
      </Stack>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && menuCardId !== null}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleShowDetails}>
          <InfoRoundedIcon fontSize="small" sx={{ mr: 1 }} />
          Info
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuCardId) {
              onCardEdit?.(menuCardId);
              handleMenuClose();
            }
          }}
        >
          <EditRoundedIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuCardId) {
              onCardDelete?.(menuCardId);
              handleMenuClose();
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteRoundedIcon fontSize="small" sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      <CardDetailsModal
        open={detailsModalOpen}
        card={selectedCard}
        onClose={() => setDetailsModalOpen(false)}
      />
    </Paper>
  );
}
