import { useMemo, useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { PieChart } from "@mui/x-charts/PieChart";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { initialBoards, defaultBoardCards } from "../data/initialData";
import { Board } from "../types";

export default function CrmLeadsBySourceChart() {
  const theme = useTheme();
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

  const tasksByStatus = useMemo(() => {
    let completed = 0;
    let inProgress = 0;
    let review = 0;
    let pending = 0;
    let overdue = 0;
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
            let isCompleted = false;

            if (
              card.status === "completed" ||
              columnLower.includes("completado") ||
              columnLower.includes("ganado") ||
              columnLower.includes("cerrado")
            ) {
              completed++;
              isCompleted = true;
            } else if (
              columnLower.includes("progreso") ||
              card.status === "in_progress"
            ) {
              inProgress++;
            } else if (
              columnLower.includes("revisión") ||
              columnLower.includes("revision") ||
              card.status === "review"
            ) {
              review++;
            } else {
              pending++;
            }

            if (card.dueDate && !isCompleted) {
              const dueDate = new Date(card.dueDate);
              if (dueDate < now) {
                overdue++;
              }
            }
          }
        });
      });
    });

    return [
      {
        id: 0,
        value: completed,
        label: "Completadas",
        color: theme.palette.success.main,
      },
      {
        id: 1,
        value: inProgress,
        label: "En Progreso",
        color: theme.palette.primary.main,
      },
      {
        id: 2,
        value: review,
        label: "En Revisión",
        color: theme.palette.warning.main,
      },
      {
        id: 3,
        value: pending,
        label: "Pendientes",
        color: theme.palette.grey[400],
      },
      {
        id: 4,
        value: overdue,
        label: "Vencidas",
        color: theme.palette.error.main,
      },
    ].filter((item) => item.value > 0);
  }, [boardsList, refreshTrigger, theme]);

  const total = tasksByStatus.reduce((acc, item) => acc + item.value, 0);

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
          Tareas por Estado
        </Typography>

        <Box
          sx={{
            flexGrow: 1,
            width: "100%",
            height: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {total > 0 ? (
            <PieChart
              series={[
                {
                  data: tasksByStatus,
                  arcLabel: (item) =>
                    total > 0
                      ? `${Math.round((item.value / total) * 100)}%`
                      : "",
                  arcLabelMinAngle: 20,
                  innerRadius: 50,
                  paddingAngle: 2,
                  cornerRadius: 4,
                },
              ]}
              height={280}
              slotProps={{
                legend: {
                  hidden: false,
                  itemMarkWidth: 10,
                  itemMarkHeight: 10,
                  markGap: 5,
                  itemGap: 8,
                },
              }}
              margin={{ right: 140 }}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              No hay tareas disponibles
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
