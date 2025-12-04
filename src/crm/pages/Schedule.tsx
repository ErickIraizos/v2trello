import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
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
  Avatar,
  Checkbox,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import AddIcon from '@mui/icons-material/Add';
import { useLocalStorage, useStorageListener, emitStorageChange } from '../hooks/useLocalStorage';
import { initialBoards, initialUsers, defaultBoardCards } from '../data/initialData';
import { Board, Card as CardType, User } from '../types';
import CardDetailsModal from '../components/CardDetailsModal';

interface TaskWithBoard extends CardType {
  boardId: string;
  boardTitle: string;
  columnTitle: string;
  taskCode: string;
  level: number;
  hasChildren: boolean;
}

type ViewMode = 'weeks' | 'months' | 'quarters';

export default function Schedule() {
  const [boardsList] = useLocalStorage<Board[]>('crm_boards', initialBoards);
  const [users] = useLocalStorage<User[]>('crm_users', initialUsers);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filterBoard, setFilterBoard] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editingTask, setEditingTask] = useState<TaskWithBoard | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newStartDate, setNewStartDate] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newProgress, setNewProgress] = useState<number>(0);
  const [newStatus, setNewStatus] = useState<string>('pending');
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedCardForDetails, setSelectedCardForDetails] = useState<CardType | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('months');
  const barContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let initialized = false;
    boardsList.forEach(board => {
      const isDefaultBoard = initialBoards.some(b => b.id === board.id);
      const key = `kanban_cards_${board.id}`;
      const existing = localStorage.getItem(key);
      if (!existing && isDefaultBoard) {
        localStorage.setItem(key, JSON.stringify(defaultBoardCards));
        initialized = true;
      }
    });
    if (initialized) {
      setRefreshTrigger(prev => prev + 1);
    }
  }, [boardsList]);

  const handleStorageChange = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useStorageListener(handleStorageChange);

  const tasksWithDates = useMemo(() => {
    const tasks: TaskWithBoard[] = [];
    let taskCounter = 1;

    boardsList.forEach((board, boardIndex) => {
      const boardCards = JSON.parse(localStorage.getItem(`kanban_cards_${board.id}`) || '{}');
      const boardCode = `TBT-${boardIndex + 1}`;

      board.columns.forEach((column) => {
        column.cardIds.forEach((cardId) => {
          const card = boardCards[cardId];
          if (card && (card.startDate || card.dueDate)) {
            const hasSubtasks = card.subtasks && card.subtasks.length > 0;
            tasks.push({
              ...card,
              boardId: board.id,
              boardTitle: board.title,
              columnTitle: column.title,
              taskCode: `${boardCode}${taskCounter}`,
              level: card.parentId ? 1 : 0,
              hasChildren: hasSubtasks,
            });
            taskCounter++;
          }
        });
      });
    });

    const sortedTasks = tasks.sort((a, b) => {
      if (a.parentId && !b.parentId && b.id === a.parentId) return 1;
      if (b.parentId && !a.parentId && a.id === b.parentId) return -1;
      if (a.parentId === b.parentId) {
        const dateA = new Date(a.startDate || a.dueDate || '').getTime();
        const dateB = new Date(b.startDate || b.dueDate || '').getTime();
        return dateA - dateB;
      }
      const dateA = new Date(a.startDate || a.dueDate || '').getTime();
      const dateB = new Date(b.startDate || b.dueDate || '').getTime();
      return dateA - dateB;
    });

    return sortedTasks;
  }, [boardsList, refreshTrigger]);

  const filteredTasks = useMemo(() => {
    return tasksWithDates.filter((task) => {
      const boardMatch = !filterBoard || task.boardId === filterBoard;
      const statusMatch = !filterStatus || getTaskStatus(task) === filterStatus;
      
      if (task.parentId) {
        const parentExpanded = expandedTasks.has(task.parentId);
        if (!parentExpanded) return false;
      }
      
      return boardMatch && statusMatch;
    });
  }, [tasksWithDates, filterBoard, filterStatus, expandedTasks]);

  const dateRange = useMemo(() => {
    if (filteredTasks.length === 0) {
      const today = new Date();
      return {
        start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        end: new Date(today.getFullYear(), today.getMonth() + 4, 0),
      };
    }

    const dates = filteredTasks
      .flatMap((task) => [task.startDate, task.dueDate])
      .filter(Boolean)
      .map((d) => new Date(d!));

    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    minDate.setDate(1);
    minDate.setMonth(minDate.getMonth() - 1);
    maxDate.setMonth(maxDate.getMonth() + 2);
    maxDate.setDate(0);

    return { start: minDate, end: maxDate };
  }, [filteredTasks]);

  const timeUnits = useMemo(() => {
    const units: { date: Date; label: string; subLabel?: string }[] = [];
    const current = new Date(dateRange.start);

    if (viewMode === 'weeks') {
      while (current <= dateRange.end) {
        units.push({
          date: new Date(current),
          label: current.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
        });
        current.setDate(current.getDate() + 7);
      }
    } else if (viewMode === 'months') {
      while (current <= dateRange.end) {
        units.push({
          date: new Date(current),
          label: current.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase(),
          subLabel: current.getFullYear().toString(),
        });
        current.setMonth(current.getMonth() + 1);
      }
    } else {
      while (current <= dateRange.end) {
        const quarter = Math.floor(current.getMonth() / 3) + 1;
        units.push({
          date: new Date(current),
          label: `Q${quarter}`,
          subLabel: current.getFullYear().toString(),
        });
        current.setMonth(current.getMonth() + 3);
      }
    }

    return units;
  }, [dateRange, viewMode]);

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

  function getTaskStatus(task: TaskWithBoard): string {
    if (task.status) return task.status;

    const columnLower = task.columnTitle.toLowerCase();
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const endDate = new Date(task.dueDate || '');

    if (columnLower.includes('completado') || columnLower.includes('ganado') || columnLower.includes('cerrado')) {
      return 'completed';
    }
    if (endDate < now && !columnLower.includes('completado')) return 'overdue';
    if (columnLower.includes('progreso')) return 'in_progress';
    if (columnLower.includes('revisión') || columnLower.includes('revision')) return 'review';
    return 'pending';
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#22c55e';
      case 'overdue': return '#ef4444';
      case 'in_progress': return '#3b82f6';
      case 'review': return '#f59e0b';
      default: return '#94a3b8';
    }
  };

  const getBarColor = (task: TaskWithBoard) => {
    const status = getTaskStatus(task);
    if (status === 'completed') return { bg: '#dcfce7', bar: '#22c55e', progress: '#16a34a' };
    if (status === 'overdue') return { bg: '#fef2f2', bar: '#fca5a5', progress: '#ef4444' };
    if (status === 'in_progress') return { bg: '#dbeafe', bar: '#93c5fd', progress: '#3b82f6' };
    if (status === 'review') return { bg: '#fef3c7', bar: '#fcd34d', progress: '#f59e0b' };
    return { bg: '#f1f5f9', bar: '#cbd5e1', progress: '#64748b' };
  };

  const getTaskProgress = (task: TaskWithBoard) => {
    if (task.progress !== undefined) return task.progress;
    const status = getTaskStatus(task);
    if (status === 'completed') return 100;
    if (status === 'in_progress') return 50;
    if (status === 'review') return 75;
    return 0;
  };

  const getUserByName = (name: string | undefined): User | undefined => {
    if (!name) return undefined;
    return users.find(u => u.name === name);
  };

  const handleToggleExpand = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const handleToggleComplete = (task: TaskWithBoard) => {
    const boardCards = JSON.parse(localStorage.getItem(`kanban_cards_${task.boardId}`) || '{}');
    if (boardCards[task.id]) {
      const currentStatus = getTaskStatus(task);
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      const newProgress = newStatus === 'completed' ? 100 : 0;

      boardCards[task.id] = {
        ...boardCards[task.id],
        status: newStatus,
        progress: newProgress,
      };
      localStorage.setItem(`kanban_cards_${task.boardId}`, JSON.stringify(boardCards));
      emitStorageChange(`kanban_cards_${task.boardId}`);
    }
  };

  const handleEditTask = (task: TaskWithBoard) => {
    setEditingTask(task);
    setNewStartDate(task.startDate || '');
    setNewDueDate(task.dueDate || '');
    setNewProgress(getTaskProgress(task));
    setNewStatus(getTaskStatus(task));
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
        progress: newProgress,
        status: newStatus,
      };
      localStorage.setItem(`kanban_cards_${editingTask.boardId}`, JSON.stringify(boardCards));
      emitStorageChange(`kanban_cards_${editingTask.boardId}`);
    }

    setEditDialogOpen(false);
    setEditingTask(null);
    setNewStartDate('');
    setNewDueDate('');
    setNewProgress(0);
    setNewStatus('pending');
  };

  const handleProgressBarClick = (task: TaskWithBoard, event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const newProgress = Math.round((clickX / rect.width) * 100);

    const boardCards = JSON.parse(localStorage.getItem(`kanban_cards_${task.boardId}`) || '{}');
    if (boardCards[task.id]) {
      let newStatus = task.status || 'pending';
      if (newProgress === 100) newStatus = 'completed';
      else if (newProgress > 0) newStatus = 'in_progress';
      else newStatus = 'pending';

      boardCards[task.id] = {
        ...boardCards[task.id],
        progress: newProgress,
        status: newStatus,
      };
      localStorage.setItem(`kanban_cards_${task.boardId}`, JSON.stringify(boardCards));
      emitStorageChange(`kanban_cards_${task.boardId}`);
    }
  };

  const handleShowDetails = (task: TaskWithBoard) => {
    setSelectedCardForDetails(task);
    setDetailsModalOpen(true);
  };

  const stats = useMemo(() => {
    const completed = filteredTasks.filter(t => getTaskStatus(t) === 'completed').length;
    const overdue = filteredTasks.filter(t => getTaskStatus(t) === 'overdue').length;
    const inProgress = filteredTasks.filter(t => getTaskStatus(t) === 'in_progress').length;
    return { completed, overdue, inProgress, total: filteredTasks.length };
  }, [filteredTasks]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'overdue': return 'Vencido';
      case 'in_progress': return 'En Progreso';
      case 'review': return 'En Revisión';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          Cronograma
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
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
              <MenuItem value="overdue">Vencido</MenuItem>
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
        <Card variant="outlined" sx={{ overflow: 'hidden' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', backgroundColor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ minWidth: '350px', maxWidth: '350px', display: 'flex', borderRight: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ width: '50px', p: 1.5, borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}></Typography>
                  </Box>
                  <Box sx={{ width: '70px', p: 1.5, borderRight: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}></Typography>
                  </Box>
                  <Box sx={{ flex: 1, p: 1.5, display: 'flex', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Task</Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                  {timeUnits.map((unit, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        flex: 1,
                        minWidth: viewMode === 'weeks' ? '80px' : viewMode === 'months' ? '100px' : '150px',
                        p: 1,
                        textAlign: 'center',
                        borderRight: idx < timeUnits.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                        backgroundColor: unit.date.getMonth() === new Date().getMonth() && unit.date.getFullYear() === new Date().getFullYear() ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        {unit.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box sx={{ maxHeight: '600px', overflowY: 'auto' }}>
                {filteredTasks.map((task, taskIndex) => {
                  const position = getTaskBarPosition(task);
                  const colors = getBarColor(task);
                  const progress = getTaskProgress(task);
                  const status = getTaskStatus(task);
                  const user = getUserByName(task.createdBy);
                  const isCompleted = status === 'completed';

                  return (
                    <Box
                      key={task.id}
                      sx={{
                        display: 'flex',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        minHeight: '48px',
                        alignItems: 'center',
                        backgroundColor: taskIndex % 2 === 0 ? 'transparent' : 'action.hover',
                        '&:hover': {
                          backgroundColor: 'action.selected',
                        },
                        transition: 'background-color 0.15s ease',
                        pl: task.level > 0 ? 2 : 0,
                      }}
                    >
                      <Box sx={{ minWidth: '350px', maxWidth: '350px', display: 'flex', borderRight: '1px solid', borderColor: 'divider', height: '100%' }}>
                        <Box
                          sx={{
                            width: '50px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRight: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          {task.hasChildren ? (
                            <IconButton size="small" onClick={() => handleToggleExpand(task.id)} sx={{ p: 0.5 }}>
                              {expandedTasks.has(task.id) ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                            </IconButton>
                          ) : (
                            <Checkbox
                              size="small"
                              checked={isCompleted}
                              onChange={() => handleToggleComplete(task)}
                              icon={<RadioButtonUncheckedIcon sx={{ color: 'text.disabled' }} />}
                              checkedIcon={<CheckCircleIcon sx={{ color: 'success.main' }} />}
                              sx={{ p: 0.5 }}
                            />
                          )}
                        </Box>
                        <Box
                          sx={{
                            width: '70px',
                            display: 'flex',
                            alignItems: 'center',
                            px: 1,
                            borderRight: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: getStatusColor(status),
                              fontWeight: 600,
                              fontSize: '0.7rem',
                            }}
                          >
                            {task.taskCode}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            px: 1.5,
                            cursor: 'pointer',
                          }}
                          onClick={() => handleShowDetails(task)}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              textDecoration: isCompleted ? 'line-through' : 'none',
                              color: isCompleted ? 'text.disabled' : 'text.primary',
                            }}
                          >
                            {task.title}
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        ref={barContainerRef}
                        sx={{
                          flex: 1,
                          position: 'relative',
                          height: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            left: `${position.left}%`,
                            width: `${Math.max(position.width, 5)}%`,
                            minWidth: '80px',
                            height: '28px',
                            backgroundColor: colors.bg,
                            borderRadius: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: `1px solid ${colors.bar}`,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              boxShadow: 2,
                              transform: 'scale(1.02)',
                            },
                          }}
                          onClick={(e) => handleProgressBarClick(task, e)}
                        >
                          <Tooltip
                            title={
                              <Box>
                                <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
                                  {task.title}
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block' }}>
                                  Progreso: {progress}%
                                </Typography>
                                <Typography variant="caption" sx={{ display: 'block' }}>
                                  Estado: {getStatusLabel(status)}
                                </Typography>
                                {task.startDate && (
                                  <Typography variant="caption" sx={{ display: 'block' }}>
                                    Inicio: {new Date(task.startDate).toLocaleDateString('es-ES')}
                                  </Typography>
                                )}
                                {task.dueDate && (
                                  <Typography variant="caption" sx={{ display: 'block' }}>
                                    Vence: {new Date(task.dueDate).toLocaleDateString('es-ES')}
                                  </Typography>
                                )}
                                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontStyle: 'italic' }}>
                                  Clic para ajustar progreso
                                </Typography>
                              </Box>
                            }
                          >
                            <Box sx={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center' }}>
                              <Box
                                sx={{
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                  bottom: 0,
                                  width: `${progress}%`,
                                  backgroundColor: colors.bar,
                                  borderRadius: '14px 0 0 14px',
                                  transition: 'width 0.3s ease',
                                }}
                              />
                              {user && (
                                <Avatar
                                  sx={{
                                    width: 22,
                                    height: 22,
                                    fontSize: '0.65rem',
                                    backgroundColor: colors.progress,
                                    color: 'white',
                                    ml: 0.5,
                                    zIndex: 1,
                                    border: '2px solid white',
                                  }}
                                >
                                  {user.avatar}
                                </Avatar>
                              )}
                              {isCompleted && (
                                <CheckCircleIcon
                                  sx={{
                                    fontSize: '1rem',
                                    color: 'success.main',
                                    ml: 'auto',
                                    mr: 1,
                                    zIndex: 1,
                                  }}
                                />
                              )}
                              {!isCompleted && progress > 0 && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    ml: 'auto',
                                    mr: 1,
                                    zIndex: 1,
                                    fontWeight: 600,
                                    fontSize: '0.65rem',
                                    color: progress > 50 ? 'white' : 'text.primary',
                                  }}
                                >
                                  {progress}%
                                </Typography>
                              )}
                            </Box>
                          </Tooltip>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleEditTask(task)}
                          sx={{
                            position: 'absolute',
                            right: 8,
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            '.MuiBox-root:hover > &': {
                              opacity: 1,
                            },
                          }}
                        >
                          <EditRoundedIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </CardContent>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button
              startIcon={<AddIcon />}
              size="small"
              variant="text"
              sx={{ color: 'primary.main' }}
            >
              Create
            </Button>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, newValue) => newValue && setViewMode(newValue)}
              size="small"
            >
              <ToggleButton value="weeks" sx={{ px: 2, py: 0.5, fontSize: '0.75rem' }}>
                Weeks
              </ToggleButton>
              <ToggleButton value="months" sx={{ px: 2, py: 0.5, fontSize: '0.75rem' }}>
                Months
              </ToggleButton>
              <ToggleButton value="quarters" sx={{ px: 2, py: 0.5, fontSize: '0.75rem' }}>
                Quarters
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Card>
      )}

      <Box sx={{ mt: 3, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
          Leyenda de Estados
        </Typography>
        <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: '16px', height: '16px', backgroundColor: '#22c55e', borderRadius: '4px' }} />
            <Typography variant="caption">Completado</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: '16px', height: '16px', backgroundColor: '#3b82f6', borderRadius: '4px' }} />
            <Typography variant="caption">En Progreso</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: '16px', height: '16px', backgroundColor: '#f59e0b', borderRadius: '4px' }} />
            <Typography variant="caption">En Revisión</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: '16px', height: '16px', backgroundColor: '#94a3b8', borderRadius: '4px' }} />
            <Typography variant="caption">Pendiente</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: '16px', height: '16px', backgroundColor: '#ef4444', borderRadius: '4px' }} />
            <Typography variant="caption">Vencido</Typography>
          </Box>
        </Stack>
      </Box>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Editar Tarea
          </Typography>
          {editingTask && (
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  {editingTask.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip label={editingTask.boardTitle} size="small" variant="outlined" />
                  <Chip label={editingTask.taskCode} size="small" color="primary" variant="outlined" />
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
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={newStatus}
                  label="Estado"
                  onChange={(e) => {
                    setNewStatus(e.target.value);
                    if (e.target.value === 'completed') setNewProgress(100);
                  }}
                >
                  <MenuItem value="pending">Pendiente</MenuItem>
                  <MenuItem value="in_progress">En Progreso</MenuItem>
                  <MenuItem value="review">En Revisión</MenuItem>
                  <MenuItem value="completed">Completado</MenuItem>
                  <MenuItem value="overdue">Vencido</MenuItem>
                </Select>
              </FormControl>
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Progreso: {newProgress}%
                </Typography>
                <Slider
                  value={newProgress}
                  onChange={(_, value) => setNewProgress(value as number)}
                  min={0}
                  max={100}
                  step={5}
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 25, label: '25%' },
                    { value: 50, label: '50%' },
                    { value: 75, label: '75%' },
                    { value: 100, label: '100%' },
                  ]}
                  sx={{ mt: 1 }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
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
