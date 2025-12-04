import React, { useMemo, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Stack,
  TextField,
  Button,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Menu,
  Dialog,
  Grid,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { useLocalStorage, useStorageListener } from '../hooks/useLocalStorage';
import { useActivityLog } from '../hooks/useActivityLog';
import { initialBoards } from '../data/initialData';
import { Board, Card as CardType } from '../types';

export default function Lists() {
  const [boards] = useLocalStorage<Board[]>('crm_boards', initialBoards);
  const [searchText, setSearchText] = useState('');
  const [filterBoard, setFilterBoard] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCreator, setFilterCreator] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [openFilters, setOpenFilters] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { addLog } = useActivityLog();

  const handleStorageChange = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useStorageListener(handleStorageChange);

  // Obtener todas las tarjetas de todos los tableros
  const allCards = useMemo(() => {
    const cards: (CardType & { boardId: string; boardTitle: string; columnTitle: string })[] = [];

    boards.forEach((board) => {
      const boardCards = JSON.parse(localStorage.getItem(`kanban_cards_${board.id}`) || '{}');

      board.columns.forEach((column) => {
        column.cardIds.forEach((cardId) => {
          const card = boardCards[cardId];
          if (card) {
            cards.push({
              ...card,
              boardId: board.id,
              boardTitle: board.title,
              columnTitle: column.title,
            });
          }
        });
      });
    });

    return cards;
  }, [boards, refreshTrigger]);

  // Filtrar tarjetas
  const filteredCards = useMemo(() => {
    return allCards.filter((card) => {
      const searchMatch =
        card.title.toLowerCase().includes(searchText.toLowerCase()) ||
        card.description?.toLowerCase().includes(searchText.toLowerCase());

      const boardMatch = !filterBoard || card.boardId === filterBoard;
      const statusMatch = !filterStatus || card.columnTitle === filterStatus;
      const priorityMatch = !filterPriority || card.priority === filterPriority;
      const creatorMatch = !filterCreator || card.createdBy === filterCreator;
      const dateFromMatch = !filterDateFrom || (card.dueDate && new Date(card.dueDate) >= new Date(filterDateFrom));
      const dateToMatch = !filterDateTo || (card.dueDate && new Date(card.dueDate) <= new Date(filterDateTo));

      return searchMatch && boardMatch && statusMatch && priorityMatch && creatorMatch && dateFromMatch && dateToMatch;
    });
  }, [allCards, searchText, filterBoard, filterStatus, filterPriority, filterCreator, filterDateFrom, filterDateTo]);

  // Extraer valores únicos para filtros
  const uniqueStatuses = useMemo(
    () => [...new Set(allCards.map((c) => c.columnTitle))],
    [allCards]
  );
  const uniquePriorities = useMemo(
    () => [...new Set(allCards.filter((c) => c.priority).map((c) => c.priority!))],
    [allCards]
  );
  const uniqueCreators = useMemo(
    () => [...new Set(allCards.filter((c) => c.createdBy).map((c) => c.createdBy!))],
    [allCards]
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, cardId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedCardId(cardId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCardId(null);
  };

  const handleDeleteCard = (cardId: string, cardTitle: string) => {
    if (window.confirm(`¿Está seguro de que desea eliminar "${cardTitle}"?`)) {
      const card = allCards.find((c) => c.id === cardId);
      if (card) {
        const boardCards = JSON.parse(localStorage.getItem(`kanban_cards_${card.boardId}`) || '{}');
        delete boardCards[cardId];
        localStorage.setItem(`kanban_cards_${card.boardId}`, JSON.stringify(boardCards));
        addLog('Eliminar', 'Tarjeta', cardTitle, cardId, { tablero: card.boardTitle });
        window.location.reload();
      }
    }
    handleMenuClose();
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

  const getStatusColor = (status: string): 'primary' | 'success' | 'warning' | 'error' | 'info' => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('exploración') || statusLower.includes('planeación')) return 'info';
    if (statusLower.includes('progreso')) return 'warning';
    if (statusLower.includes('revisión')) return 'primary';
    if (statusLower.includes('completado') || statusLower.includes('ganado')) return 'success';
    return 'default';
  };

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Listas
        </Typography>
        <Button variant="contained" startIcon={<AddRoundedIcon />}>
          Nueva Tarjeta
        </Button>
      </Box>

      {/* Búsqueda y Filtros */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <TextField
              placeholder="Buscar por título o descripción..."
              fullWidth
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              size="small"
            />

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
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

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filterStatus}
                  label="Estado"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {uniqueStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Prioridad</InputLabel>
                <Select
                  value={filterPriority}
                  label="Prioridad"
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {uniquePriorities.map((priority) => (
                    <MenuItem key={priority} value={priority}>
                      {priority}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Creador</InputLabel>
                <Select
                  value={filterCreator}
                  label="Creador"
                  onChange={(e) => setFilterCreator(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {uniqueCreators.map((creator) => (
                    <MenuItem key={creator} value={creator}>
                      {creator}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                startIcon={<FilterListRoundedIcon />}
                onClick={() => setOpenFilters(!openFilters)}
                size="small"
              >
                Más Filtros
              </Button>
            </Box>

            {openFilters && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                <TextField
                  label="Fecha desde"
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{ minWidth: 150 }}
                />
                <TextField
                  label="Fecha hasta"
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  sx={{ minWidth: 150 }}
                />
                <Button
                  variant="text"
                  size="small"
                  onClick={() => {
                    setSearchText('');
                    setFilterBoard('');
                    setFilterStatus('');
                    setFilterPriority('');
                    setFilterCreator('');
                    setFilterDateFrom('');
                    setFilterDateTo('');
                  }}
                >
                  Limpiar Filtros
                </Button>
              </Box>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Tabla de Tarjetas */}
      <Card variant="outlined">
        <CardContent sx={{ p: 0 }}>
          {filteredCards.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No hay tarjetas que coincidan con los filtros
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'action.hover' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tablero</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Prioridad</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Creador</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Vencimiento</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Valor</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCards.map((card) => (
                    <TableRow key={card.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {card.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {card.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={card.boardTitle} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={card.columnTitle}
                          size="small"
                          color={getStatusColor(card.columnTitle)}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {card.priority && (
                          <Chip
                            label={card.priority}
                            size="small"
                            color={getPriorityColor(card.priority)}
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{card.createdBy || 'Sin Asignar'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color={new Date(card.dueDate || '') < new Date() ? 'error' : 'text.primary'}>
                          {card.dueDate ? new Date(card.dueDate).toLocaleDateString('es-ES') : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {card.value && (
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ${card.value.toLocaleString()}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, card.id)}
                        >
                          <MoreVertRoundedIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              {filteredCards.length} de {allCards.length} tarjetas
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Menú de Acciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl) && selectedCardId !== null}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <EditRoundedIcon fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem
          onClick={() => {
            const card = allCards.find((c) => c.id === selectedCardId);
            if (card) {
              handleDeleteCard(card.id, card.title);
            }
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteRoundedIcon fontSize="small" sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>
    </Box>
  );
}
