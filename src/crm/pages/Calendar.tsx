import React, { useMemo, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
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
import { useLocalStorage, useStorageListener } from '../hooks/useLocalStorage';
import { initialBoards } from '../data/initialData';
import { Board, Card as CardType } from '../types';
import CardDetailsModal from '../components/CardDetailsModal';

export default function Calendar() {
  const [boards] = useLocalStorage<Board[]>('crm_boards', initialBoards);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchText, setSearchText] = useState('');
  const [filterBoard, setFilterBoard] = useState('');
  const [draggedCard, setDraggedCard] = useState<(CardType & { boardId: string }) | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingCard, setEditingCard] = useState<(CardType & { boardId: string }) | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCardForMenu, setSelectedCardForMenu] = useState<(CardType & { boardId: string }) | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedCardForDetails, setSelectedCardForDetails] = useState<CardType | null>(null);

  const handleStorageChange = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useStorageListener(handleStorageChange);

  // Obtener todas las tarjetas de todos los tableros
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

  // Tarjetas sin fecha de vencimiento (no programadas)
  const unscheduledCards = useMemo(() => {
    return allCards.filter((card) => !card.dueDate);
  }, [allCards]);

  // Filtrar tarjetas no programadas
  const filteredCards = useMemo(() => {
    return unscheduledCards.filter((card) => {
      const searchMatch =
        card.title.toLowerCase().includes(searchText.toLowerCase()) ||
        card.description?.toLowerCase().includes(searchText.toLowerCase());
      const boardMatch = !filterBoard || card.boardId === filterBoard;
      return searchMatch && boardMatch;
    });
  }, [unscheduledCards, searchText, filterBoard]);

  // Tarjetas programadas en el mes actual
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
  const emptyDays = Array.from({ length: firstDay }, (_, i) => null);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDragStart = (card: CardType & { boardId: string }) => {
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
      window.location.reload();
    }

    setDraggedCard(null);
  };

  const getCardsForDay = (day: number) => {
    return scheduledCards.filter((card) => {
      const cardDate = new Date(card.dueDate!);
      return cardDate.getDate() === day;
    });
  };

  const handleEditCardDate = (card: CardType & { boardId: string }) => {
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
      window.dispatchEvent(new CustomEvent('crm-storage-change', { detail: { key: `kanban_cards_${editingCard.boardId}` } }));
    }

    setEditDialogOpen(false);
    setEditingCard(null);
    setEditDate('');
  };

  const handleCardMenuOpen = (event: React.MouseEvent<HTMLElement>, card: CardType & { boardId: string }) => {
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
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Grid container spacing={3}>
        {/* Calendario */}
        <Grid item xs={12} md={7}>
          <Card variant="outlined">
            <CardContent>
              {/* Header del calendario */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Button
                  startIcon={<ChevronLeftRoundedIcon />}
                  onClick={handlePrevMonth}
                  size="small"
                >
                  Anterior
                </Button>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </Typography>
                <Button
                  endIcon={<ChevronRightRoundedIcon />}
                  onClick={handleNextMonth}
                  size="small"
                >
                  Siguiente
                </Button>
              </Box>

              {/* Días de la semana */}
              <Grid container spacing={1} sx={{ mb: 1 }}>
                {dayNames.map((day) => (
                  <Grid item xs={12 / 7} key={day}>
                    <Box sx={{ textAlign: 'center', fontWeight: 600, py: 1 }}>
                      <Typography variant="caption">{day}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              {/* Días del mes */}
              <Grid container spacing={1}>
                {[...emptyDays, ...daysArray].map((day, index) => {
                  const isToday = day && new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString() === new Date().toDateString();
                  const isPast = day && new Date(currentDate.getFullYear(), currentDate.getMonth(), day) < new Date();

                  return (
                  <Grid item xs={12 / 7} key={index}>
                    <Paper
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => day && handleDropOnDay(day)}
                      sx={{
                        minHeight: '120px',
                        p: 1.5,
                        backgroundColor: !day ? 'action.disabledBackground' : isToday ? 'action.selected' : 'background.paper',
                        border: '1px solid',
                        borderColor: isToday ? 'primary.main' : 'divider',
                        borderWidth: isToday ? 2 : 1,
                        cursor: draggedCard && day ? 'grab' : 'default',
                        opacity: draggedCard && day ? 0.9 : 1,
                        transition: 'all 0.2s ease',
                        '&:hover': day ? {
                          backgroundColor: 'action.hover',
                          boxShadow: 1,
                          borderColor: 'primary.main',
                        } : {},
                      }}
                    >
                      {day && (
                        <>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              display: 'block',
                              mb: 0.5,
                              color: isPast ? 'text.secondary' : isToday ? 'primary.main' : 'text.primary',
                              fontSize: isToday ? '0.95rem' : '0.875rem',
                            }}
                          >
                            {day}
                          </Typography>
                          <Stack spacing={0.5}>
                            {getCardsForDay(day).map((card) => (
                              <Box
                                key={card.id}
                                sx={{
                                  backgroundColor: 'primary.main',
                                  color: 'white',
                                  p: 0.75,
                                  borderRadius: 1,
                                  fontSize: '0.75rem',
                                  overflow: 'hidden',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    backgroundColor: 'primary.dark',
                                    boxShadow: 1,
                                  },
                                  position: 'relative',
                                  group: 'card-item',
                                  title: card.title,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    flex: 1,
                                  }}
                                >
                                  {card.title}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.25 }}>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleShowCardDetails();
                                      setSelectedCardForDetails(card);
                                      setDetailsModalOpen(true);
                                    }}
                                    sx={{
                                      color: 'white',
                                      padding: '2px',
                                      '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                      },
                                    }}
                                    title="Ver detalles"
                                  >
                                    <InfoRoundedIcon sx={{ fontSize: '0.875rem' }} />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditCardDate(card);
                                    }}
                                    sx={{
                                      color: 'white',
                                      padding: '2px',
                                      '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                      },
                                    }}
                                    title="Editar fecha"
                                  >
                                    <EditRoundedIcon sx={{ fontSize: '0.875rem' }} />
                                  </IconButton>
                                </Box>
                              </Box>
                            ))}
                          </Stack>
                        </>
                      )}
                    </Paper>
                  </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel de actividades no programadas */}
        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Actividad no programada
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Arrastra cada actividad al calendario para establecer una fecha de vencimiento para la actividad.
              </Typography>

              {/* Búsqueda */}
              <TextField
                placeholder="Buscar elementos sin planificar"
                fullWidth
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                InputProps={{
                  startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                size="small"
                sx={{ mb: 2 }}
              />

              {/* Filtro */}
              <Button
                variant="outlined"
                startIcon={<FilterListRoundedIcon />}
                onClick={() => setShowFilters(!showFilters)}
                size="small"
                sx={{ mb: showFilters ? 2 : 0 }}
              >
                Filtros
              </Button>

              {showFilters && (
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Tablero</InputLabel>
                  <Select
                    value={filterBoard}
                    label="Tablero"
                    onChange={(e) => setFilterBoard(e.target.value)}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    {boards.map((board) => (
                      <MenuItem key={board.id} value={board.id}>
                        {board.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {/* Lista de actividades */}
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Más recientes
              </Typography>

              {filteredCards.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                  <Typography variant="body2">No hay actividades sin planificar</Typography>
                </Box>
              ) : (
                <Stack spacing={1}>
                  {filteredCards.map((card) => (
                    <Paper
                      key={card.id}
                      draggable
                      onDragStart={() => handleDragStart(card)}
                      sx={{
                        p: 1.5,
                        backgroundColor: 'background.paper',
                        border: '1px solid',
                        borderColor: draggedCard?.id === card.id ? 'primary.main' : 'divider',
                        cursor: 'grab',
                        '&:hover': {
                          boxShadow: 1,
                          backgroundColor: 'action.hover',
                        },
                        '&:active': {
                          cursor: 'grabbing',
                        },
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 1,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {card.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                          <Chip label={card.boardTitle} size="small" variant="outlined" />
                          {card.priority && (
                            <Chip
                              label={card.priority}
                              size="small"
                              color={card.priority === 'alta' ? 'error' : card.priority === 'media' ? 'warning' : 'default'}
                              variant="outlined"
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
                        sx={{ mt: -0.5, mr: -0.5 }}
                      >
                        <MoreVertRoundedIcon fontSize="small" />
                      </IconButton>
                    </Paper>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Editar Fecha de Vencimiento
          </Typography>
          {editingCard && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Tarjeta: {editingCard.title}
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
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
                <Button variant="contained" onClick={handleSaveEditDate}>
                  Guardar
                </Button>
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
          Info
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
          Editar Fecha
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
