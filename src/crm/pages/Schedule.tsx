import { useMemo, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Dialog,
  TextField,
  Button,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import { useLocalStorage, useStorageListener, emitStorageChange } from '../hooks/useLocalStorage';
import { initialBoards } from '../data/initialData';
import { Board, Card as CardType } from '../types';
import CardDetailsModal from '../components/CardDetailsModal';

interface TaskWithBoard extends CardType {
  boardId: string;
  boardTitle: string;
  columnTitle: string;
}

export default function Schedule() {
  const [boardsList] = useLocalStorage<Board[]>('crm_boards', initialBoards);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filterBoard, setFilterBoard] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editingTask, setEditingTask] = useState<TaskWithBoard | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newStartDate, setNewStartDate] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedCardForDetails, setSelectedCardForDetails] = useState<CardType | null>(null);

  const handleStorageChange = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useStorageListener(handleStorageChange);

  const tasksWithDates = useMemo(() => {
    const tasks: TaskWithBoard[] = [];

    boardsList.forEach((board) => {
      const boardCards = JSON.parse(localStorage.getItem(`kanban_cards_${board.id}`) || '{}');

      board.columns.forEach((column) => {
        column.cardIds.forEach((cardId) => {
          const card = boardCards[cardId];
          if (card && (card.startDate || card.dueDate)) {
            tasks.push({
              ...card,
              boardId: board.id,
              boardTitle: board.title,
              columnTitle: column.title,
            });
          }
        });
      });
    });

    return tasks.sort((a, b) => {
      const dateA = new Date(a.startDate || a.dueDate || '').getTime();
      const dateB = new Date(b.startDate || b.dueDate || '').getTime();
      return dateA - dateB;
    });
  }, [boardsList, refreshTrigger]);

  const filteredTasks = useMemo(() => {
    return tasksWithDates.filter((task) => {
      const boardMatch = !filterBoard || task.boardId === filterBoard;
      const statusMatch = !filterStatus || getStatusType(task) === filterStatus;
      return boardMatch && statusMatch;
    });
  }, [tasksWithDates, filterBoard, filterStatus]);

  const dateRange = useMemo(() => {
    if (filteredTasks.length === 0) {
      const today = new Date();
      return {
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: new Date(today.getFullYear(), today.getMonth() + 6, 0),
      };
    }

    const dates = filteredTasks
      .flatMap((task) => [task.startDate, task.dueDate])
      .filter(Boolean)
      .map((d) => new Date(d!));

    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
    
    minDate.setDate(1);
    maxDate.setMonth(maxDate.getMonth() + 1);
    maxDate.setDate(0);

    return { start: minDate, end: maxDate };
  }, [filteredTasks]);

  const monthsInRange = useMemo(() => {
    const months = [];
    const current = new Date(dateRange.start);

    while (current <= dateRange.end) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }

    return months;
  }, [dateRange]);

  const getTaskBarPosition = (task: TaskWithBoard) => {
    const startDate = task.startDate ? new Date(task.startDate) : new Date(task.dueDate!);
    const endDate = new Date(task.dueDate || task.startDate!);

    const totalDays = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const taskStartDays = Math.ceil((startDate.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const taskDuration = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      left: Math.max(0, (taskStartDays / totalDays) * 100),
      width: Math.min(100 - (taskStartDays / totalDays) * 100, (taskDuration / totalDays) * 100),
    };
  };

  function getStatusType(task: TaskWithBoard): string {
    const columnLower = task.columnTitle.toLowerCase();
    if (columnLower.includes('completado') || columnLower.includes('ganado') || columnLower.includes('cerrado')) {
      return 'completed';
    }
    if (columnLower.includes('progreso')) return 'in_progress';
    if (columnLower.includes('revisión') || columnLower.includes('revision')) return 'review';
    return 'pending';
  }

  const getStatusColor = (task: TaskWithBoard) => {
    const status = getStatusType(task);
    const now = new Date();
    const endDate = new Date(task.dueDate || task.startDate || '');

    if (status === 'completed') return '#4CAF50';
    if (endDate < now && status !== 'completed') return '#f44336';
    if (status === 'in_progress') return '#2196F3';
    if (status === 'review') return '#FF9800';
    return '#9E9E9E';
  };

  const isTaskOverdue = (task: TaskWithBoard) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const endDate = new Date(task.dueDate || '');
    return endDate < now && getStatusType(task) !== 'completed';
  };

  const handleEditTask = (task: TaskWithBoard) => {
    setEditingTask(task);
    setNewStartDate(task.startDate || '');
    setNewDueDate(task.dueDate || '');
    setEditDialogOpen(true);
  };

  const handleSaveTaskDates = () => {
    if (!editingTask) return;

    const boardCards = JSON.parse(localStorage.getItem(`kanban_cards_${editingTask.boardId}`) || '{}');
    if (boardCards[editingTask.id]) {
      boardCards[editingTask.id] = {
        ...boardCards[editingTask.id],
        startDate: newStartDate || undefined,
        dueDate: newDueDate || undefined,
      };
      localStorage.setItem(`kanban_cards_${editingTask.boardId}`, JSON.stringify(boardCards));
      emitStorageChange(`kanban_cards_${editingTask.boardId}`);
    }

    setEditDialogOpen(false);
    setEditingTask(null);
    setNewStartDate('');
    setNewDueDate('');
  };

  const handleShowDetails = (task: TaskWithBoard) => {
    setSelectedCardForDetails(task);
    setDetailsModalOpen(true);
  };

  const stats = useMemo(() => {
    const completed = filteredTasks.filter(t => getStatusType(t) === 'completed').length;
    const overdue = filteredTasks.filter(t => isTaskOverdue(t)).length;
    const inProgress = filteredTasks.filter(t => getStatusType(t) === 'in_progress').length;
    return { completed, overdue, inProgress, total: filteredTasks.length };
  }, [filteredTasks]);

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Cronograma
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Tablero</InputLabel>
            <Select value={filterBoard} label="Tablero" onChange={(e) => setFilterBoard(e.target.value)}>
              <MenuItem value="">Todos</MenuItem>
              {boardsList.map((board) => (
                <MenuItem key={board.id} value={board.id}>
                  {board.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Estado</InputLabel>
            <Select value={filterStatus} label="Estado" onChange={(e) => setFilterStatus(e.target.value)}>
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="pending">Pendiente</MenuItem>
              <MenuItem value="in_progress">En Progreso</MenuItem>
              <MenuItem value="review">En Revisión</MenuItem>
              <MenuItem value="completed">Completado</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Card variant="outlined" sx={{ flex: '1 1 150px', minWidth: '150px' }}>
          <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="caption" color="text.secondary">Total Tareas</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>{stats.total}</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ flex: '1 1 150px', minWidth: '150px', borderColor: 'success.main' }}>
          <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="caption" color="success.main">Completadas</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>{stats.completed}</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ flex: '1 1 150px', minWidth: '150px', borderColor: 'info.main' }}>
          <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="caption" color="info.main">En Progreso</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'info.main' }}>{stats.inProgress}</Typography>
          </CardContent>
        </Card>
        <Card variant="outlined" sx={{ flex: '1 1 150px', minWidth: '150px', borderColor: 'error.main' }}>
          <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="caption" color="error.main">Vencidas</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'error.main' }}>{stats.overdue}</Typography>
          </CardContent>
        </Card>
      </Box>

      {filteredTasks.length === 0 ? (
        <Card variant="outlined">
          <CardContent sx={{ py: 6, textAlign: 'center' }}>
            <CalendarTodayRoundedIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No hay tareas con fechas asignadas
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Asigna fechas a las tarjetas en los tableros para verlas en el cronograma
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card variant="outlined">
          <CardContent sx={{ p: 0, overflow: 'auto' }}>
            <Box sx={{ minWidth: '900px' }}>
              <Box sx={{ display: 'flex', backgroundColor: 'action.hover', borderBottom: '2px solid', borderColor: 'divider' }}>
                <Box sx={{ minWidth: '280px', maxWidth: '280px', p: 2, fontWeight: 600, borderRight: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Tarea</Typography>
                </Box>
                <Box sx={{ flex: 1, display: 'flex' }}>
                  {monthsInRange.map((month, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        flex: 1,
                        p: 1.5,
                        textAlign: 'center',
                        fontWeight: 600,
                        borderRight: idx < monthsInRange.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                        backgroundColor: month.getMonth() === new Date().getMonth() && month.getFullYear() === new Date().getFullYear() ? 'primary.50' : 'transparent',
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                        {month.toLocaleDateString('es-ES', { month: 'short' })}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.65rem' }}>
                        {month.getFullYear()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              {filteredTasks.map((task, taskIndex) => {
                const position = getTaskBarPosition(task);
                const barColor = getStatusColor(task);
                const overdue = isTaskOverdue(task);

                return (
                  <Box
                    key={task.id}
                    sx={{
                      display: 'flex',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      minHeight: '70px',
                      alignItems: 'center',
                      backgroundColor: taskIndex % 2 === 0 ? 'transparent' : 'action.hover',
                      '&:hover': {
                        backgroundColor: 'action.selected',
                      },
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <Box
                      sx={{
                        minWidth: '280px',
                        maxWidth: '280px',
                        p: 1.5,
                        borderRight: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {task.title}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            <Chip label={task.boardTitle} size="small" variant="outlined" sx={{ height: '20px', fontSize: '0.65rem' }} />
                            {task.priority && (
                              <Chip
                                label={task.priority}
                                size="small"
                                color={task.priority === 'alta' ? 'error' : task.priority === 'media' ? 'warning' : 'default'}
                                sx={{ height: '20px', fontSize: '0.65rem' }}
                              />
                            )}
                            {overdue && (
                              <Chip label="Vencido" size="small" color="error" sx={{ height: '20px', fontSize: '0.65rem' }} />
                            )}
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                          <Tooltip title="Ver detalles">
                            <IconButton size="small" onClick={() => handleShowDetails(task)} sx={{ p: 0.5 }}>
                              <InfoRoundedIcon sx={{ fontSize: '1rem' }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Editar fechas">
                            <IconButton size="small" onClick={() => handleEditTask(task)} sx={{ p: 0.5 }}>
                              <EditRoundedIcon sx={{ fontSize: '1rem' }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        flex: 1,
                        position: 'relative',
                        height: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        px: 1,
                      }}
                    >
                      <Tooltip
                        title={
                          <Box>
                            <Typography variant="caption" sx={{ display: 'block' }}>
                              {task.startDate && `Inicio: ${new Date(task.startDate).toLocaleDateString('es-ES')}`}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block' }}>
                              {task.dueDate && `Vence: ${new Date(task.dueDate).toLocaleDateString('es-ES')}`}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block' }}>
                              Estado: {task.columnTitle}
                            </Typography>
                          </Box>
                        }
                      >
                        <Box
                          onClick={() => handleEditTask(task)}
                          sx={{
                            position: 'absolute',
                            left: `${position.left}%`,
                            width: `${Math.max(position.width, 3)}%`,
                            minWidth: '60px',
                            height: '32px',
                            backgroundColor: barColor,
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            px: 1,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: 1,
                            '&:hover': {
                              boxShadow: 3,
                              transform: 'translateY(-2px) scale(1.02)',
                              filter: 'brightness(1.1)',
                            },
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.65rem',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {task.dueDate && new Date(task.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card>
      )}

      <Box sx={{ mt: 3, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
          Leyenda de Estados
        </Typography>
        <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: '16px', height: '16px', backgroundColor: '#4CAF50', borderRadius: '4px' }} />
            <Typography variant="caption">Completado</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: '16px', height: '16px', backgroundColor: '#2196F3', borderRadius: '4px' }} />
            <Typography variant="caption">En Progreso</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: '16px', height: '16px', backgroundColor: '#FF9800', borderRadius: '4px' }} />
            <Typography variant="caption">En Revisión</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: '16px', height: '16px', backgroundColor: '#9E9E9E', borderRadius: '4px' }} />
            <Typography variant="caption">Pendiente</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: '16px', height: '16px', backgroundColor: '#f44336', borderRadius: '4px' }} />
            <Typography variant="caption">Vencido</Typography>
          </Box>
        </Stack>
      </Box>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Editar Fechas de la Tarea
          </Typography>
          {editingTask && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  {editingTask.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip label={editingTask.boardTitle} size="small" variant="outlined" />
                  <Chip label={editingTask.columnTitle} size="small" color="primary" variant="outlined" />
                </Box>
              </Box>
              <TextField
                label="Fecha de Inicio"
                fullWidth
                type="date"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Fecha de Vencimiento"
                fullWidth
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
                <Button variant="contained" onClick={handleSaveTaskDates}>
                  Guardar
                </Button>
              </Box>
            </Stack>
          )}
        </Box>
      </Dialog>

      <CardDetailsModal
        open={detailsModalOpen}
        card={selectedCardForDetails}
        onClose={() => setDetailsModalOpen(false)}
      />
    </Box>
  );
}
