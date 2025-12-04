import { useMemo, useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import Copyright from "../../dashboard/internals/components/Copyright";
import CrmStatCard from "./CrmStatCard";
import CrmRecentDealsTable from "./CrmRecentDealsTable";
import CrmUpcomingTasks from "./CrmUpcomingTasks";
import CrmSalesChart from "./CrmSalesChart";
import CrmLeadsBySourceChart from "./CrmLeadsBySourceChart";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { initialBoards, defaultBoardCards } from "../data/initialData";
import { Board } from "../types";
import { useNavigate } from "react-router-dom";

interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  totalBoards: number;
}

export default function CrmMainDashboard() {
  const navigate = useNavigate();
  const [boardsList] = useLocalStorage<Board[]>("crm_boards", initialBoards);
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

  const stats = useMemo<TaskStats>(() => {
    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;
    let overdueTasks = 0;
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
            totalTasks++;

            const isCompleted =
              card.status === "completed" ||
              columnLower.includes("completado") ||
              columnLower.includes("ganado") ||
              columnLower.includes("cerrado");

            if (isCompleted) {
              completedTasks++;
            } else if (
              columnLower.includes("progreso") ||
              card.status === "in_progress"
            ) {
              inProgressTasks++;
            }

            if (card.dueDate && !isCompleted) {
              const dueDate = new Date(card.dueDate);
              if (dueDate < now) {
                overdueTasks++;
              }
            }
          }
        });
      });
    });

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      totalBoards: boardsList.length,
    };
  }, [boardsList, refreshTrigger]);

  const statCardsData = [
    {
      title: "Total de Tareas",
      value: stats.totalTasks.toString(),
      interval: "En todos los tableros",
      trend: "neutral" as const,
      trendValue: `${stats.totalBoards} tableros`,
      data: Array(30)
        .fill(0)
        .map((_, i) => Math.floor(stats.totalTasks * (0.5 + i * 0.017))),
    },
    {
      title: "Tareas Completadas",
      value: stats.completedTasks.toString(),
      interval: "Progreso general",
      trend: "up" as const,
      trendValue:
        stats.totalTasks > 0
          ? `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}%`
          : "0%",
      data: Array(30)
        .fill(0)
        .map((_, i) => Math.floor(stats.completedTasks * (0.3 + i * 0.023))),
    },
    {
      title: "En Progreso",
      value: stats.inProgressTasks.toString(),
      interval: "Tareas activas",
      trend: "neutral" as const,
      trendValue: "activas",
      data: Array(30)
        .fill(0)
        .map((_, i) =>
          Math.floor(stats.inProgressTasks * (0.7 + Math.sin(i / 5) * 0.3))
        ),
    },
    {
      title: "Tareas Vencidas",
      value: stats.overdueTasks.toString(),
      interval: "Requieren atención",
      trend: stats.overdueTasks > 0 ? ("down" as const) : ("neutral" as const),
      trendValue: stats.overdueTasks > 0 ? "urgente" : "al día",
      data: Array(30)
        .fill(0)
        .map((_, i) => Math.max(0, stats.overdueTasks - Math.floor(i / 10))),
    },
  ];

  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3, display: { xs: "none", sm: "flex" } }}
      >
        <Typography variant="h5" component="h2">
          Resumen del Panel
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            sx={{ mr: 1 }}
            onClick={() => navigate("/tables")}
          >
            Nueva Tarea
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            onClick={() => navigate("/tables")}
          >
            Nuevo Tablero
          </Button>
        </Box>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            lg: "1fr 1fr 1fr 1fr",
          },
          gap: 2,
          mb: 3,
        }}
      >
        {statCardsData.map((card, index) => (
          <CrmStatCard
            key={index}
            title={card.title}
            value={card.value}
            interval={card.interval}
            trend={card.trend}
            trendValue={card.trendValue}
            data={card.data}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap: 2,
          mb: 3,
        }}
      >
        <CrmSalesChart />
        <CrmLeadsBySourceChart />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
          gap: 2,
          mb: 3,
        }}
      >
        <CrmRecentDealsTable />
        <Stack spacing={2}>
          <CrmUpcomingTasks />
        </Stack>
      </Box>

      <Copyright sx={{ mt: 3, mb: 4 }} />
    </Box>
  );
}
