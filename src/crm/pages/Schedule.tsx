import React, { useMemo, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useLocalStorage, useStorageListener } from '../hooks/useLocalStorage';
import { initialBoards } from '../data/initialData';
import { Board, Card as CardType } from '../types';

interface TaskWithBoard extends CardType {
  boardId: string;
  boardTitle: string;
  columnTitle: string;
}

export default function Schedule() {
  const [boardsList, setBoardsList] = useLocalStorage<Board[]>('crm_boards', initialBoards);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filterBoard, setFilterBoard] = useState('');
  const [timelineView, setTimelineView] = useState<'weeks' | 'months' | 'quarters'>('months');
  const [editingTask, setEditingTask] = useState<TaskWithBoard | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newTaskState, setNewTaskState] = useState('');

  const handleStorageChange = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useStorageListener(handleStorageChange);

  // Obtener todas las tarjetas con fechas
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

  // Filtrar tareas
  const filteredTasks = useMemo(() => {
    return tasksWithDates.filter((task) => !filterBoard || task.boardId === filterBoard);
  }, [tasksWithDates, filterBoard]);

  // Calcular rango de fechas
  const dateRange = useMemo(() => {
    if (filteredTasks.length === 0) {
      const today = new Date();
      return {
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: new Date(today.getFullYear(), today.getMonth() + 11, 30),
      };
    }

    const dates = filteredTasks
      .flatMap((task) => [task.startDate, task.dueDate])
      .filter(Boolean)
      .map((d) => new Date(d!));

    const start = new Date(Math.min(...dates.map((d) => d.getTime())));
    start.setDate(1);

    const end = new Date(Math.max(...dates.map((d) => d.getTime())));
    end.setMonth(end.getMonth() + 1);
    end.setDate(1);
    end.setDate(0);

    return { start, end };
  }, [filteredTasks]);

  // Generar meses en el rango
  const monthsInRange = useMemo(() => {
    const months = [];
    const current = new Date(dateRange.start);

    while (current <= dateRange.end) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }

    return months;
  }, [dateRange]);

  // Calcular ancho de la barra y posición
  const getTaskBarPosition = (task: TaskWithBoard) => {
    const startDate = task.startDate ? new Date(task.startDate) : new Date(task.dueDate!);
    const endDate = new Date(task.dueDate || task.startDate!);

    const totalDays = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const taskStartDays = Math.ceil((startDate.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
    const taskDuration = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    return {
      left: (taskStartDays / totalDays) * 100,
      width: (taskDuration / totalDays) * 100,
    };
  };

  // Determinar color por estado
  const getStatusColor = (task: TaskWithBoard) => {
    const now = new Date();
    const endDate = new Date(task.dueDate || task.startDate || '');

    if (endDate < now) return '#9C27B0'; // Completado
    if (task.columnTitle.toLowerCase().includes('completado') || task.columnTitle.toLowerCase().includes('ganado')) {
      return '#4CAF50'; // Verde - Completado
    }
    if (task.columnTitle.toLowerCase().includes('progreso')) return '#2196F3'; // Azul - En progreso
    if (task.columnTitle.toLowerCase().includes('revisión')) return '#FF9800'; // Naranja - Revisión
    return '#757575'; // Gris - Por hacer
  };

  const isTaskOverdue = (task: TaskWithBoard) => {
    const now = new Date();
    const endDate = new Date(task.dueDate || '');
    return endDate < now && !task.columnTitle.toLowerCase().includes('completado');
  };

  const handleEditTaskProgress = (task: TaskWithBoard) => {
    setEditingTask(task);
    setNewTaskState(task.columnTitle);
    setEditDialogOpen(true);
  };

  const handleSaveTaskProgress = () => {
    if (!editingTask || !newTaskState) return;

    const board = boardsList.find(b => b.id === editingTask.boardId);
    if (!board) return;

    // Encontrar la columna actual y nueva
    const currentColumn = board.columns.find(col => col.cardIds.includes(editingTask.id));
    const newColumn = board.columns.find(col => col.title === newTaskState);

    if (!newColumn) return;

    // Actualizar el board
    const updatedBoard = { ...board };
    updatedBoard.columns = updatedBoard.columns.map(col => ({
      ...col,
      cardIds: col.id === currentColumn?.id
        ? col.cardIds.filter(id => id !== editingTask.id)
        : col.id === newColumn.id
        ? [...col.cardIds, editingTask.id]
        : col.cardIds,
    }));

    const updatedBoardsList = boardsList.map(b => b.id === updatedBoard.id ? updatedBoard : b);
    setBoardsList(updatedBoardsList);

    setEditDialogOpen(false);
    setEditingTask(null);
    setNewTaskState('');
  };

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Cronograma
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
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
        </Box>
      </Box>

      {filteredTasks.length === 0 ? (
        <Card variant="outlined">
          <CardContent>
            <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
              No hay tareas con fechas asignadas
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card variant="outlined">
          <CardContent sx={{ p: 0, overflow: 'auto' }}>
            <Box sx={{ minWidth: '1200px' }}>
              {/* Header con meses */}
              <Box sx={{ display: 'flex', backgroundColor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ minWidth: '300px', p: 2, fontWeight: 600, borderRight: '1px solid', borderColor: 'divider' }}>
                  Tarea
                </Box>
                <Box sx={{ flex: 1, display: 'flex', borderLeft: '1px solid', borderColor: 'divider' }}>
                  {monthsInRange.map((month, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        flex: 1,
                        p: 2,
                        textAlign: 'center',
                        fontWeight: 600,
                        borderRight: idx < monthsInRange.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                        fontSize: '0.875rem',
                      }}
                    >
                      {month.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }).toUpperCase()}
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Filas de tareas */}
              {filteredTasks.map((task) => {
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
                      minHeight: '80px',
                      alignItems: 'center',
                    }}
                  >
                    {/* Nombre de la tarea */}
                    <Box
                      sx={{
                        minWidth: '300px',
                        p: 2,
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        maxWidth: '300px',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {task.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5, flexWrap: 'wrap' }}>
                        <Chip label={task.boardTitle} size="small" variant="outlined" />
                        {task.priority && (
                          <Chip
                            label={task.priority}
                            size="small"
                            color={task.priority === 'alta' ? 'error' : task.priority === 'media' ? 'warning' : 'default'}
                            variant="outlined"
                          />
                        )}
                      </Box>
                      {overdue && (
                        <Chip label="Vencido" size="small" color="error" variant="filled" />
                      )}
                    </Box>

                    {/* Barra de timeline */}
                    <Box
                      sx={{
                        flex: 1,
                        p: 2,
                        position: 'relative',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Box
                        onClick={() => handleEditTaskProgress(task)}
                        sx={{
                          position: 'absolute',
                          left: `${position.left}%`,
                          width: `${position.width}%`,
                          minWidth: '80px',
                          height: '40px',
                          backgroundColor: barColor,
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          px: 1,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            boxShadow: 3,
                            opacity: 0.95,
                            transform: 'translateY(-2px)',
                          },
                          color: 'white',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          overflow: 'hidden',
                          title: task.title,
                          gap: 0.5,
                        }}
                      >
                        {task.dueDate && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.65rem',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {new Date(task.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                          </Typography>
                        )}
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditTaskProgress(task);
                          }}
                          sx={{
                            color: 'white',
                            padding: '2px',
                            marginLeft: 'auto',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            },
                          }}
                          title="Editar progreso"
                        >
                          <EditRoundedIcon sx={{ fontSize: '0.875rem' }} />
                        </IconButton>
                      </Box>

                      {/* Indicadores de progreso */}
                      {task.columnTitle.toLowerCase().includes('completado') && (
                        <Box
                          sx={{
                            position: 'absolute',
                            right: `calc(${100 - position.left - position.width}% - 5px)`,
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: '#4CAF50',
                            border: '2px solid white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        >
                          ✓
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Leyenda:
        </Typography>
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: '20px', height: '20px', backgroundColor: '#4CAF50', borderRadius: '2px' }} />
            <Typography variant="caption">Completado</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: '20px', height: '20px', backgroundColor: '#2196F3', borderRadius: '2px' }} />
            <Typography variant="caption">En Progreso</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: '20px', height: '20px', backgroundColor: '#FF9800', borderRadius: '2px' }} />
            <Typography variant="caption">Revisión</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: '20px', height: '20px', backgroundColor: '#757575', borderRadius: '2px' }} />
            <Typography variant="caption">Por Hacer</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: '20px', height: '20px', backgroundColor: '#9C27B0', borderRadius: '2px' }} />
            <Typography variant="caption">Vencido</Typography>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
