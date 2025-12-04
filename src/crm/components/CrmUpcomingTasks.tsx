import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";

// Sample data for upcoming tasks
const upcomingTasks = [
  {
    id: 1,
    task: "Dar seguimiento a TechSolutions Inc sobre propuesta en la nube",
    completed: false,
    priority: "alta",
    dueDate: "Hoy, 2:00 PM",
  },
  {
    id: 2,
    task: "Preparar presentación para proyecto de sitio web de Global Media",
    completed: false,
    priority: "media",
    dueDate: "Mañana, 10:00 AM",
  },
  {
    id: 3,
    task: "Llamar a HealthCare Pro sobre detalles del contrato",
    completed: false,
    priority: "alta",
    dueDate: "Hoy, 4:30 PM",
  },
  {
    id: 4,
    task: "Actualizar cronograma de implementación de CRM para RetailGiant",
    completed: true,
    priority: "media",
    dueDate: "Ayer",
  },
  {
    id: 5,
    task: "Enviar documentos de propuesta a Acme Corp",
    completed: false,
    priority: "baja",
    dueDate: "28 Sep, 2023",
  },
];

// Function to get priority color
const getPriorityColor = (
  priority: string,
): "error" | "warning" | "default" => {
  switch (priority) {
    case "alta":
      return "error";
    case "media":
      return "warning";
    default:
      return "default";
  }
};

export default function CrmUpcomingTasks() {
  const [tasks, setTasks] = React.useState(upcomingTasks);

  const handleToggle = (id: number) => () => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 }, flexGrow: 1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ p: 2, pb: 1 }}
        >
          <Typography variant="h6" component="h3">
            Tareas Próximas
          </Typography>
          <Button endIcon={<ArrowForwardRoundedIcon />} size="small">
            Ver Todo
          </Button>
        </Stack>

        <List sx={{ width: "100%", bgcolor: "background.paper" }}>
          {tasks.map((task) => {
            const labelId = `checkbox-list-label-${task.id}`;

            return (
              <ListItem
                key={task.id}
                secondaryAction={
                  <IconButton edge="end" aria-label="more details">
                    <ArrowForwardRoundedIcon />
                  </IconButton>
                }
                disablePadding
              >
                <ListItemButton
                  role={undefined}
                  onClick={handleToggle(task.id)}
                  dense
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={task.completed}
                      tabIndex={-1}
                      disableRipple
                      inputProps={{ "aria-labelledby": labelId }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    id={labelId}
                    primary={
                      <Typography
                        sx={{
                          textDecoration: task.completed
                            ? "line-through"
                            : "none",
                          color: task.completed
                            ? "text.secondary"
                            : "text.primary",
                        }}
                      >
                        {task.task}
                      </Typography>
                    }
                    secondary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mt: 0.5,
                        }}
                      >
                        <Chip
                          label={task.priority}
                          size="small"
                          color={getPriorityColor(task.priority)}
                          variant="outlined"
                          sx={{
                            height: 20,
                            "& .MuiChip-label": { px: 1, py: 0 },
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {task.dueDate}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </CardContent>
    </Card>
  );
}
