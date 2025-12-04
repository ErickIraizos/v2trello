import * as React from "react";
import { useMemo, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { initialBoards, defaultBoardCards, initialUsers } from "../data/initialData";
import { Board, Card as CardType, User } from "../types";

interface TaskWithBoard extends CardType {
  boardId: string;
  boardTitle: string;
  columnTitle: string;
}

const getStatusColor = (
  status: string
): "default" | "primary" | "success" | "warning" | "error" | "info" => {
  switch (status) {
    case "completed":
      return "success";
    case "in_progress":
      return "primary";
    case "review":
      return "warning";
    case "overdue":
      return "error";
    default:
      return "default";
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case "completed":
      return "Completado";
    case "in_progress":
      return "En Progreso";
    case "review":
      return "En Revisión";
    case "overdue":
      return "Vencido";
    default:
      return "Pendiente";
  }
};

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "-";
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
  };
  return new Date(dateString).toLocaleDateString("es-ES", options);
};

export default function CrmRecentDealsTable() {
  const navigate = useNavigate();
  const [boardsList] = useLocalStorage<Board[]>("crm_boards", initialBoards);
  const [users] = useLocalStorage<User[]>("crm_users", initialUsers);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    boardsList.forEach((board) => {
      const isDefaultBoard = initialBoards.some((b) => b.id === board.id);
      const key = `kanban_cards_${board.id}`;
      const existing = localStorage.getItem(key);
      if (!existing && isDefaultBoard) {
        localStorage.setItem(key, JSON.stringify(defaultBoardCards));
      }
    });
    setRefreshTrigger((prev) => prev + 1);
  }, [boardsList]);

  const recentTasks = useMemo(() => {
    const tasks: TaskWithBoard[] = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    boardsList.forEach((board) => {
      const boardCards = JSON.parse(
        localStorage.getItem(`kanban_cards_${board.id}`) || "{}"
      );

      board.columns.forEach((column) => {
        const columnLower = column.title.toLowerCase();
        column.cardIds.forEach((cardId) => {
          const card = boardCards[cardId];
          if (card) {
            let status = card.status || "pending";

            if (
              columnLower.includes("completado") ||
              columnLower.includes("ganado") ||
              columnLower.includes("cerrado")
            ) {
              status = "completed";
            } else if (columnLower.includes("progreso")) {
              status = "in_progress";
            } else if (
              columnLower.includes("revisión") ||
              columnLower.includes("revision")
            ) {
              status = "review";
            }

            if (card.dueDate && status !== "completed") {
              const dueDate = new Date(card.dueDate);
              if (dueDate < now) {
                status = "overdue";
              }
            }

            tasks.push({
              ...card,
              status,
              boardId: board.id,
              boardTitle: board.title,
              columnTitle: column.title,
            });
          }
        });
      });
    });

    return tasks
      .sort((a, b) => {
        const dateA = new Date(a.dueDate || a.startDate || "").getTime();
        const dateB = new Date(b.dueDate || b.startDate || "").getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [boardsList, refreshTrigger]);

  const getUserByName = (name: string | undefined): User | undefined => {
    if (!name) return undefined;
    return users.find((u) => u.name === name);
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
      <CardContent sx={{ pb: 0 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" component="h3">
            Tareas Recientes
          </Typography>
          <Button
            endIcon={<ArrowForwardRoundedIcon />}
            size="small"
            onClick={() => navigate("/tables")}
          >
            Ver Tableros
          </Button>
        </Stack>
      </CardContent>
      <TableContainer sx={{ flexGrow: 1 }}>
        <Table size="small" aria-label="recent tasks table">
          <TableHead>
            <TableRow>
              <TableCell>Tarea</TableCell>
              <TableCell>Tablero</TableCell>
              <TableCell>Responsable</TableCell>
              <TableCell>Progreso</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha Límite</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentTasks.map((task) => {
              const user = getUserByName(task.createdBy);
              const progress = task.progress ?? (task.status === "completed" ? 100 : 0);

              return (
                <TableRow key={task.id} hover>
                  <TableCell sx={{ fontWeight: 500, maxWidth: 200 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {task.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.boardTitle}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: "0.7rem" }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          fontSize: "0.7rem",
                          bgcolor: "primary.main",
                        }}
                      >
                        {user?.avatar || task.createdBy?.charAt(0) || "?"}
                      </Avatar>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: "0.75rem" }}
                      >
                        {task.createdBy?.split(" ")[0] || "Sin asignar"}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ minWidth: 100 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          width: 60,
                          height: 6,
                          borderRadius: 3,
                          bgcolor: "action.hover",
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {progress}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(task.status || "pending")}
                      size="small"
                      color={getStatusColor(task.status || "pending")}
                      sx={{ fontSize: "0.65rem" }}
                    />
                  </TableCell>
                  <TableCell>{formatDate(task.dueDate)}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" aria-label="more options">
                      <MoreVertRoundedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
