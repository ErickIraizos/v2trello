import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Paper,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Divider,
  Alert,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface TodoItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: "alta" | "media" | "baja";
  createdAt: string;
}

type FilterType = "todas" | "pendientes" | "completadas";

const PRIORITY_COLORS = {
  alta: "error" as const,
  media: "warning" as const,
  baja: "success" as const,
};

const PRIORITY_LABELS = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

const initialTodos: TodoItem[] = [
  {
    id: "todo-1",
    title: "Revisar proposals de clientes",
    description: "Revisar y aprobar propuestas pendientes",
    completed: false,
    priority: "alta",
    createdAt: new Date().toISOString(),
  },
  {
    id: "todo-2",
    title: "Actualizar CRM con nuevos contactos",
    description: "Agregar información de leads nuevos",
    completed: false,
    priority: "media",
    createdAt: new Date().toISOString(),
  },
  {
    id: "todo-3",
    title: "Preparar presentación trimestral",
    description: "Crear slides para la reunión del viernes",
    completed: true,
    priority: "alta",
    createdAt: new Date().toISOString(),
  },
];

export default function Tasks() {
  const [todos, setTodos] = useLocalStorage<TodoItem[]>(
    "crm_todos",
    initialTodos,
  );
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [newTodoDescription, setNewTodoDescription] = useState("");
  const [newTodoPriority, setNewTodoPriority] = useState<
    "alta" | "media" | "baja"
  >("media");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("todas");
  const [error, setError] = useState<string | null>(null);

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      const matchesSearch =
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        todo.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (filter === "pendientes") return matchesSearch && !todo.completed;
      if (filter === "completadas") return matchesSearch && todo.completed;
      return matchesSearch;
    });
  }, [todos, searchQuery, filter]);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [todos]);

  const handleAddTodo = () => {
    setError(null);

    const trimmedTitle = newTodoTitle.trim();
    const trimmedDescription = newTodoDescription.trim();

    if (!trimmedTitle) {
      setError("El título de la tarea es requerido");
      return;
    }

    if (trimmedTitle.length < 3) {
      setError("El título debe tener al menos 3 caracteres");
      return;
    }

    const newTodo: TodoItem = {
      id: `todo-${Date.now()}`,
      title: trimmedTitle,
      description: trimmedDescription,
      completed: false,
      priority: newTodoPriority,
      createdAt: new Date().toISOString(),
    };

    setTodos([newTodo, ...todos]);
    setNewTodoTitle("");
    setNewTodoDescription("");
    setNewTodoPriority("media");
  };

  const handleToggleComplete = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const handleDeleteTodo = (id: string) => {
    if (window.confirm("¿Está seguro de que desea eliminar esta tarea?")) {
      setTodos(todos.filter((todo) => todo.id !== id));
    }
  };

  const handleClearCompleted = () => {
    const completedCount = todos.filter((t) => t.completed).length;
    if (completedCount === 0) return;

    if (window.confirm(`¿Eliminar las ${completedCount} tareas completadas?`)) {
      setTodos(todos.filter((todo) => !todo.completed));
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "900px" } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 600 }}>
        Mis Tareas
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <Chip
          label={`Total: ${stats.total}`}
          color="default"
          variant="outlined"
        />
        <Chip
          label={`Pendientes: ${stats.pending}`}
          color="primary"
          variant="outlined"
        />
        <Chip
          label={`Completadas: ${stats.completed}`}
          color="success"
          variant="outlined"
        />
      </Box>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Nueva Tarea
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Título de la tarea"
            fullWidth
            value={newTodoTitle}
            onChange={(e) => {
              setNewTodoTitle(e.target.value);
              setError(null);
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleAddTodo();
            }}
            placeholder="Ej: Llamar a cliente potencial"
            autoFocus
          />

          <TextField
            label="Descripción (opcional)"
            fullWidth
            multiline
            rows={2}
            value={newTodoDescription}
            onChange={(e) => setNewTodoDescription(e.target.value)}
            placeholder="Agrega más detalles sobre la tarea"
          />

          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Prioridad</InputLabel>
              <Select
                value={newTodoPriority}
                label="Prioridad"
                onChange={(e) =>
                  setNewTodoPriority(
                    e.target.value as "alta" | "media" | "baja",
                  )
                }
              >
                <MenuItem value="alta">Alta</MenuItem>
                <MenuItem value="media">Media</MenuItem>
                <MenuItem value="baja">Baja</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={handleAddTodo}
            >
              Agregar Tarea
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <TextField
            size="small"
            placeholder="Buscar tareas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 200 }}
          />

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Filtrar</InputLabel>
            <Select
              value={filter}
              label="Filtrar"
              onChange={(e) => setFilter(e.target.value as FilterType)}
            >
              <MenuItem value="todas">Todas</MenuItem>
              <MenuItem value="pendientes">Pendientes</MenuItem>
              <MenuItem value="completadas">Completadas</MenuItem>
            </Select>
          </FormControl>

          {stats.completed > 0 && (
            <Button
              size="small"
              color="error"
              variant="text"
              onClick={handleClearCompleted}
              sx={{ ml: "auto" }}
            >
              Limpiar completadas ({stats.completed})
            </Button>
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {filteredTodos.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.secondary">
              {searchQuery || filter !== "todas"
                ? "No se encontraron tareas con esos filtros"
                : "No hay tareas pendientes. ¡Agrega una nueva!"}
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {filteredTodos.map((todo) => (
              <ListItem
                key={todo.id}
                sx={{
                  px: 2,
                  py: 1.5,
                  mb: 1,
                  borderRadius: 1,
                  bgcolor: "action.hover",
                  textDecoration: todo.completed ? "line-through" : "none",
                  opacity: todo.completed ? 0.7 : 1,
                  transition: "all 0.2s",
                  "&:hover": {
                    bgcolor: "action.selected",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Checkbox
                    checked={todo.completed}
                    onChange={() => handleToggleComplete(todo.id)}
                    icon={<RadioButtonUncheckedRoundedIcon />}
                    checkedIcon={<CheckCircleRoundedIcon color="success" />}
                    size="small"
                  />
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: todo.completed ? 400 : 500,
                          color: todo.completed
                            ? "text.disabled"
                            : "text.primary",
                        }}
                      >
                        {todo.title}
                      </Typography>
                      <Chip
                        label={PRIORITY_LABELS[todo.priority]}
                        color={PRIORITY_COLORS[todo.priority]}
                        size="small"
                        sx={{ height: 20, fontSize: "0.65rem" }}
                      />
                    </Box>
                  }
                  secondary={
                    todo.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {todo.description}
                      </Typography>
                    )
                  }
                />

                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => handleDeleteTodo(todo.id)}
                    sx={{ color: "error.main" }}
                  >
                    <DeleteRoundedIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}
