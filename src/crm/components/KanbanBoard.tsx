import React, { useState, useEffect } from 'react';
import { Box, Stack, Typography, Button, Dialog, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { Board, Card as CardType } from '../types';
import KanbanColumn from './KanbanColumn';
import { useLocalStorage, useStorageListener } from '../hooks/useLocalStorage';
import { useActivityLog } from '../hooks/useActivityLog';
import { defaultBoardCards, initialBoards } from '../data/initialData';

interface KanbanBoardProps {
  board: Board;
  onBoardUpdate?: (board: Board) => void;
}

export default function KanbanBoard({ board, onBoardUpdate }: KanbanBoardProps) {
  const isDefaultBoard = initialBoards.some(b => b.id === board.id);
  const initialCardsForBoard = isDefaultBoard ? defaultBoardCards : {};
  const [cards, setCards] = useLocalStorage<Record<string, CardType>>(
    `kanban_cards_${board.id}`,
    initialCardsForBoard
  );
  const [displayedCards, setDisplayedCards] = useState(cards);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>(board.columns[0].id);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [newCard, setNewCard] = useState({
    title: '',
    description: '',
    customer: '',
    value: '',
    startDate: '',
    dueDate: '',
    createdBy: '',
  });
  const { addLog } = useActivityLog();

  // Sincronizar con localStorage
  useStorageListener(() => {
    const updated = JSON.parse(localStorage.getItem(`kanban_cards_${board.id}`) || JSON.stringify(initialCardsForBoard));
    setDisplayedCards(updated);
  });

  useEffect(() => {
    setDisplayedCards(cards);
  }, [cards]);

  const handleCardDragStart = (e: React.DragEvent<HTMLDivElement>, cardId: string) => {
    setDraggedCardId(cardId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.currentTarget === e.target) {
      setOverColumnId(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setOverColumnId(null);

    if (!draggedCardId) return;

    const updatedBoard = { ...board };
    const fromColumn = updatedBoard.columns.find((col) =>
      col.cardIds.includes(draggedCardId)
    );

    if (fromColumn) {
      fromColumn.cardIds = fromColumn.cardIds.filter((id) => id !== draggedCardId);
    }

    const toColumn = updatedBoard.columns.find((col) => col.id === columnId);
    if (toColumn && !toColumn.cardIds.includes(draggedCardId)) {
      toColumn.cardIds.push(draggedCardId);
    }

    onBoardUpdate?.(updatedBoard);
    setDraggedCardId(null);
  };

  const handleAddCard = () => {
    if (!newCard.title) return;

    const cardId = `card-${Date.now()}`;
    const updatedCards = {
      ...cards,
      [cardId]: {
        id: cardId,
        title: newCard.title,
        description: newCard.description,
        customer: newCard.customer || undefined,
        value: newCard.value ? parseInt(newCard.value) : undefined,
        startDate: newCard.startDate || undefined,
        dueDate: newCard.dueDate || undefined,
        createdBy: newCard.createdBy || 'Sin Asignar',
      },
    };

    setCards(updatedCards);

    const updatedBoard = { ...board };
    const column = updatedBoard.columns.find((col) => col.id === selectedColumn);
    if (column) {
      column.cardIds.push(cardId);
    }

    onBoardUpdate?.(updatedBoard);
    addLog('Crear', 'Tarjeta', newCard.title, cardId, { tablero: board.title });
    setOpenDialog(false);
    setNewCard({ title: '', description: '', customer: '', value: '', startDate: '', dueDate: '', createdBy: '' });
  };

  const handleEditCard = () => {
    if (!editingCardId || !newCard.title) return;

    const updatedCards = {
      ...cards,
      [editingCardId]: {
        ...cards[editingCardId],
        title: newCard.title,
        description: newCard.description,
        customer: newCard.customer || undefined,
        value: newCard.value ? parseInt(newCard.value) : undefined,
        startDate: newCard.startDate || undefined,
        dueDate: newCard.dueDate || undefined,
        createdBy: newCard.createdBy || 'Sin Asignar',
      },
    };

    setCards(updatedCards);
    addLog('Editar', 'Tarjeta', newCard.title, editingCardId, { tablero: board.title });
    setOpenDialog(false);
    setEditingCardId(null);
    setNewCard({ title: '', description: '', customer: '', value: '', startDate: '', dueDate: '', createdBy: '' });
  };

  const handleDeleteCard = (cardId: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta tarjeta?')) return;

    const cardTitle = cards[cardId]?.title || 'Desconocida';
    const updatedCards = { ...cards };
    delete updatedCards[cardId];
    setCards(updatedCards);

    const updatedBoard = { ...board };
    updatedBoard.columns = updatedBoard.columns.map((col) => ({
      ...col,
      cardIds: col.cardIds.filter((id) => id !== cardId),
    }));

    onBoardUpdate?.(updatedBoard);
    addLog('Eliminar', 'Tarjeta', cardTitle, cardId, { tablero: board.title });
  };

  const handleOpenEditCardDialog = (cardId: string) => {
    const card = cards[cardId];
    if (card) {
      setNewCard({
        title: card.title,
        description: card.description,
        customer: card.customer || '',
        value: card.value?.toString() || '',
        startDate: card.startDate || '',
        dueDate: card.dueDate || '',
        createdBy: card.createdBy || '',
      });
      setEditingCardId(cardId);
      setOpenDialog(true);
    }
  };

  const resetForm = () => {
    setNewCard({ title: '', description: '', customer: '', value: '', startDate: '', dueDate: '', createdBy: '' });
    setEditingCardId(null);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {board.title}
        </Typography>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => {
          resetForm();
          setOpenDialog(true);
        }}>
          Nueva Tarjeta
        </Button>
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          pb: 2,
          '&::-webkit-scrollbar': {
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'action.hover',
            borderRadius: '4px',
          },
        }}
      >
        {board.columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            cards={column.cardIds.map((cardId) => displayedCards[cardId]).filter(Boolean)}
            isOverColumn={overColumnId === column.id}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onCardDragStart={handleCardDragStart}
            onCardEdit={handleOpenEditCardDialog}
            onCardDelete={handleDeleteCard}
            draggedCardId={draggedCardId || undefined}
            cardsMap={displayedCards}
          />
        ))}
      </Box>

      <Dialog open={openDialog} onClose={() => {
        setOpenDialog(false);
        resetForm();
      }} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {editingCardId ? 'Editar Tarjeta' : 'Crear Nueva Tarjeta'}
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Título"
              fullWidth
              value={newCard.title}
              onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
              autoFocus
            />
            <TextField
              label="Descripción"
              fullWidth
              multiline
              rows={2}
              value={newCard.description}
              onChange={(e) => setNewCard({ ...newCard, description: e.target.value })}
            />
            <TextField
              label="Cliente"
              fullWidth
              value={newCard.customer}
              onChange={(e) => setNewCard({ ...newCard, customer: e.target.value })}
            />
            <TextField
              label="Valor"
              fullWidth
              type="number"
              value={newCard.value}
              onChange={(e) => setNewCard({ ...newCard, value: e.target.value })}
            />
            <TextField
              label="Fecha de Inicio"
              fullWidth
              type="date"
              value={newCard.startDate}
              onChange={(e) => setNewCard({ ...newCard, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Fecha de Vencimiento"
              fullWidth
              type="date"
              value={newCard.dueDate}
              onChange={(e) => setNewCard({ ...newCard, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Creador"
              fullWidth
              value={newCard.createdBy}
              onChange={(e) => setNewCard({ ...newCard, createdBy: e.target.value })}
              placeholder="Tu nombre"
            />
            {!editingCardId && (
              <FormControl fullWidth>
                <InputLabel>Columna</InputLabel>
                <Select value={selectedColumn} label="Columna" onChange={(e) => setSelectedColumn(e.target.value)}>
                  {board.columns.map((col) => (
                    <MenuItem key={col.id} value={col.id}>
                      {col.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setOpenDialog(false);
                resetForm();
              }}>Cancelar</Button>
              <Button variant="contained" onClick={editingCardId ? handleEditCard : handleAddCard}>
                {editingCardId ? 'Guardar Cambios' : 'Crear'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Dialog>
    </Box>
  );
}
