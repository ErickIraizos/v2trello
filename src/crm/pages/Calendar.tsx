import React, { useMemo, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Paper,
  Dialog,
  IconButton,
  Menu,
} from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import { useLocalStorage, useStorageListener, emitStorageChange } from '../hooks/useLocalStorage';
import { initialBoards } from '../data/initialData';
import { Board, Card as CardType } from '../types';
import CardDetailsModal from '../components/CardDetailsModal';

export default function Calendar() {
  const [boards] = useLocalStorage<Board[]>('crm_boards', initialBoards);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchText, setSearchText] = useState('');
  const [filterBoard, setFilterBoard] = useState('');
  const [draggedCard, setDraggedCard] = useState<(CardType & { boardId: string; boardTitle: string }) | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingCard, setEditingCard] = useState<(CardType & { boardId: string; boardTitle: string }) | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCardForMenu, setSelectedCardForMenu] = useState<(CardType & { boardId: string; boardTitle: string }) | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedCardForDetails, setSelectedCardForDetails] = useState<CardType | null>(null);

  const handleStorageChange = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useStorageListener(handleStorageChange);

  const allCards = useMemo(() => {
    const cards: (CardType & { boardId: string; boardTitle: string })[] = [];

    boards.forEach((board) => {
      const boardCards = JSON.parse(localStorage.getItem(`kanban_cards_${board.id}`) || '{}');
      Object.values<CardType>(boardCards).forEach((card) => {
        cards.push({
          ...card,
          boardId: board.id,
          boardTitle: board.title,
        });
      });
    });

    return cards;
  }, [boards, refreshTrigger]);

  const unscheduledCards = useMemo(() => {
    return allCards.filter((card) => !card.dueDate);
  }, [allCards]);

  const filteredCards = useMemo(() => {
    return unscheduledCards.filter((card) => {
      const searchMatch =
        card.title.toLowerCase().includes(searchText.toLowerCase()) ||
        card.description?.toLowerCase().includes(searchText.toLowerCase());
      const boardMatch = !filterBoard || card.boardId === filterBoard;
      return searchMatch && boardMatch;
    });
  }, [unscheduledCards, searchText, filterBoard]);

  const scheduledCards = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    return allCards.filter((card) => {
      if (!card.dueDate) return false;
      const cardDate = new Date(card.dueDate);
      return cardDate.getFullYear() === year && cardDate.getMonth() === month;
    });
  }, [allCards, currentDate]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthDays = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const daysArray = Array.from({ length: monthDays }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, () => null);
  const allDays = [...emptyDays, ...daysArray];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDragStart = (card: CardType & { boardId: string; boardTitle: string }) => {
    setDraggedCard(card);
  };

  const handleDropOnDay = (day: number) => {
    if (!draggedCard) return;

    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const boardCards = JSON.parse(localStorage.getItem(`kanban_cards_${draggedCard.boardId}`) || '{}');

    if (boardCards[draggedCard.id]) {
      boardCards[draggedCard.id] = {
        ...boardCards[draggedCard.id],
        dueDate: newDate.toISOString().split('T')[0],
      };
      localStorage.setItem(`kanban_cards_${draggedCard.boardId}`, JSON.stringify(boardCards));
      emitStorageChange(`kanban_cards_${draggedCard.boardId}`);
    }

    setDraggedCard(null);
  };

  const getCardsForDay = (day: number) => {
    return scheduledCards.filter((card) => {
      const cardDate = new Date(card.dueDate!);
      return cardDate.getDate() === day;
    });
  };

  const handleEditCardDate = (card: CardType & { boardId: string; boardTitle: string }) => {
    setEditingCard(card);
    setEditDate(card.dueDate || '');
    setEditDialogOpen(true);
  };

  const handleSaveEditDate = () => {
    if (!editingCard || !editDate) return;

    const boardCards = JSON.parse(localStorage.getItem(`kanban_cards_${editingCard.boardId}`) || '{}');
    if (boardCards[editingCard.id]) {
      boardCards[editingCard.id] = {
        ...boardCards[editingCard.id],
        dueDate: editDate,
      };
      localStorage.setItem(`kanban_cards_${editingCard.boardId}`, JSON.stringify(boardCards));
      emitStorageChange(`kanban_cards_${editingCard.boardId}`);
    }

    setEditDialogOpen(false);
    setEditingCard(null);
    setEditDate('');
  };

  const handleRemoveDate = () => {
    if (!editingCard) return;

    const boardCards = JSON.parse(localStorage.getItem(`kanban_cards_${editingCard.boardId}`) || '{}');
    if (boardCards[editingCard.id]) {
      const { dueDate, ...cardWithoutDate } = boardCards[editingCard.id];
      boardCards[editingCard.id] = cardWithoutDate;
      localStorage.setItem(`kanban_cards_${editingCard.boardId}`, JSON.stringify(boardCards));
      emitStorageChange(`kanban_cards_${editingCard.boardId}`);
    }

    setEditDialogOpen(false);
    setEditingCard(null);
    setEditDate('');
  };

  const handleCardMenuOpen = (event: React.MouseEvent<HTMLElement>, card: CardType & { boardId: string; boardTitle: string }) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedCardForMenu(card);
  };

  const handleCardMenuClose = () => {
    setAnchorEl(null);
    setSelectedCardForMenu(null);
  };

  const handleShowCardDetails = () => {
    if (selectedCardForMenu) {
      setSelectedCardForDetails(selectedCardForMenu);
      setDetailsModalOpen(true);
    }
    handleCardMenuClose();
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Calendario
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ flex: { xs: '1 1 auto', md: '0 0 60%' } }}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    startIcon={<ChevronLeftRoundedIcon />}
                    onClick={handlePrevMonth}
                    size="small"
                    variant="outlined"
                  >
                    Anterior
                  </Button>
                  <Button
                    startIcon={<TodayRoundedIcon />}
                    onClick={handleGoToToday}
                    size="small"
                    variant="text"
                  >
                    Hoy
                  </Button>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </Typography>
                <Button
                  endIcon={<ChevronRightRoundedIcon />}
                  onClick={handleNextMonth}
                  size="small"
                  variant="outlined"
                >
                  Siguiente
                </Button>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: 0.5,
                  mb: 1,
                }}
              >
                {dayNames.map((day) => (
                  <Box
                    key={day}
                    sx={{
                      textAlign: 'center',
                      fontWeight: 600,
                      py: 1.5,
                      backgroundColor: 'action.hover',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>{day}</Typography>
                  </Box>
                ))}
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: 0.5,
                }}
              >
                {allDays.map((day, index) => {
                  const isToday = day && new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString() === new Date().toDateString();
                  const isPast = day && new Date(currentDate.getFullYear(), currentDate.getMonth(), day) < new Date(new Date().setHours(0, 0, 0, 0));
                  const dayCards = day ? getCardsForDay(day) : [];

                  return (
                    <Paper
                      key={index}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                      }}
                      onDrop={() => day && handleDropOnDay(day)}
                      sx={{
                        minHeight: '100px',
                        p: 1,
                        backgroundColor: !day ? 'action.disabledBackground' : isToday ? 'primary.50' : 'background.paper',
                        border: '2px solid',
                        borderColor: isToday ? 'primary.main' : draggedCard && day ? 'primary.light' : 'divider',
                        cursor: draggedCard && day ? 'copy' : 'default',
                        transition: 'all 0.2s ease',
                        '&:hover': day ? {
                          backgroundColor: draggedCard ? 'primary.50' : 'action.hover',
                          boxShadow: 1,
                          borderColor: 'primary.main',
                        } : {},
                        borderRadius: 1,
                        position: 'relative',
                      }}
                    >
                      {day && (
                        <>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: isToday ? 700 : 600,
                                fontSize: isToday ? '1rem' : '0.875rem',
                                backgroundColor: isToday ? 'primary.main' : 'transparent',
                                color: isToday ? 'white' : isPast ? 'text.disabled' : 'text.primary',
                                borderRadius: '50%',
                                width: isToday ? '28px' : 'auto',
                                height: isToday ? '28px' : 'auto',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {day}
                            </Typography>
                            {dayCards.length > 2 && (
                              <Chip
                                label={`+${dayCards.length - 2}`}
                                size="small"
                                sx={{ height: '18px', fontSize: '0.65rem' }}
                              />
                            )}
                          </Box>
                          <Stack spacing={0.5}>
                            {dayCards.slice(0, 2).map((card) => (
                              <Box
                                key={card.id}
                                onClick={() => {
                                  setSelectedCardForDetails(card);
                                  setDetailsModalOpen(true);
                                }}
                                sx={{
                                  backgroundColor: 'primary.main',
                                  color: 'white',
                                  p: 0.5,
                                  borderRadius: 0.5,
                                  fontSize: '0.7rem',
                                  overflow: 'hidden',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  gap: 0.25,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  '&:hover': {
                                    backgroundColor: 'primary.dark',
                                    transform: 'scale(1.02)',
                                  },
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    flex: 1,
                                    fontSize: '0.7rem',
                                  }}
                                >
                                  {card.title}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditCardDate(card);
                                  }}
                                  sx={{
                                    color: 'white',
                                    padding: '1px',
                                    '&:hover': {
                                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    },
                                  }}
                                >
                                  <EditRoundedIcon sx={{ fontSize: '0.75rem' }} />
                                </IconButton>
                              </Box>
                            ))}
                          </Stack>
                        </>
                      )}
                    </Paper>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 auto', md: '0 0 38%' } }}>
          <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Actividades sin programar
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Arrastra las actividades al calendario para asignarles una fecha.
              </Typography>

              <TextField
                placeholder="Buscar actividades..."
                fullWidth
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                InputProps={{
                  startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                size="small"
                sx={{ mb: 2 }}
              />

              <Button
                variant="outlined"
                startIcon={<FilterListRoundedIcon />}
                onClick={() => setShowFilters(!showFilters)}
                size="small"
                sx={{ mb: 2, alignSelf: 'flex-start' }}
              >
                {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </Button>

              {showFilters && (
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Tablero</InputLabel>
                  <Select
                    value={filterBoard}
                    label="Tablero"
                    onChange={(e) => setFilterBoard(e.target.value)}
                  >
                    <MenuItem value="">Todos los tableros</MenuItem>
                    {boards.map((board) => (
                      <MenuItem key={board.id} value={board.id}>
                        {board.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>
                {filteredCards.length} actividades sin fecha
              </Typography>

              {filteredCards.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                  <TodayRoundedIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                  <Typography variant="body2">Todas las actividades tienen fecha asignada</Typography>
                </Box>
              ) : (
                <Stack spacing={1} sx={{ flex: 1, overflow: 'auto' }}>
                  {filteredCards.map((card) => (
                    <Paper
                      key={card.id}
                      draggable
                      onDragStart={() => handleDragStart(card)}
                      onDragEnd={() => setDraggedCard(null)}
                      sx={{
                        p: 1.5,
                        backgroundColor: 'background.paper',
                        border: '2px solid',
                        borderColor: draggedCard?.id === card.id ? 'primary.main' : 'divider',
                        borderStyle: draggedCard?.id === card.id ? 'dashed' : 'solid',
                        cursor: 'grab',
                        opacity: draggedCard?.id === card.id ? 0.5 : 1,
                        '&:hover': {
                          boxShadow: 2,
                          backgroundColor: 'action.hover',
                          borderColor: 'primary.light',
                        },
                        '&:active': {
                          cursor: 'grabbing',
                        },
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {card.title}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 0.5 }}>
                            <Chip label={card.boardTitle} size="small" variant="outlined" sx={{ height: '20px', fontSize: '0.7rem' }} />
                            {card.priority && (
                              <Chip
                                label={card.priority}
                                size="small"
                                color={card.priority === 'alta' ? 'error' : card.priority === 'media' ? 'warning' : 'default'}
                                variant="filled"
                                sx={{ height: '20px', fontSize: '0.7rem' }}
                              />
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {card.createdBy || 'Sin asignar'}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => handleCardMenuOpen(e, card)}
                        >
                          <MoreVertRoundedIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Editar Fecha de Vencimiento
          </Typography>
          {editingCard && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  {editingCard.title}
                </Typography>
                <Chip label={editingCard.boardTitle} size="small" variant="outlined" />
              </Box>
              <TextField
                label="Fecha de Vencimiento"
                fullWidth
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
                <Button color="error" onClick={handleRemoveDate}>
                  Quitar Fecha
                </Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
                  <Button variant="contained" onClick={handleSaveEditDate}>
                    Guardar
                  </Button>
                </Box>
              </Box>
            </Stack>
          )}
        </Box>
      </Dialog>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCardMenuClose}
      >
        <MenuItem onClick={handleShowCardDetails}>
          <InfoRoundedIcon fontSize="small" sx={{ mr: 1 }} />
          Ver Detalles
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedCardForMenu) {
              handleEditCardDate(selectedCardForMenu);
              handleCardMenuClose();
            }
          }}
        >
          <EditRoundedIcon fontSize="small" sx={{ mr: 1 }} />
          Asignar Fecha
        </MenuItem>
      </Menu>

      <CardDetailsModal
        open={detailsModalOpen}
        card={selectedCardForDetails}
        onClose={() => setDetailsModalOpen(false)}
      />
    </Box>
  );
}
