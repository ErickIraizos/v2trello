import * as React from "react";
import { useMemo, useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import { BarChart } from "@mui/x-charts/BarChart";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { initialBoards, defaultBoardCards } from "../data/initialData";
import { Board } from "../types";

export default function CrmSalesChart() {
  const theme = useTheme();
  const [timeRange, setTimeRange] = React.useState("year");
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

  const handleTimeRangeChange = (
    _: React.MouseEvent<HTMLElement>,
    newTimeRange: string | null
  ) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };

  const monthNames = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  const taskStats = useMemo(() => {
    let completedTasks = 0;
    let pendingTasks = 0;
    let inProgressTasks = 0;

    boardsList.forEach((board) => {
      const boardCards = JSON.parse(
        localStorage.getItem(`kanban_cards_${board.id}`) || "{}"
      );

      board.columns.forEach((column) => {
        const columnLower = column.title.toLowerCase();
        column.cardIds.forEach((cardId) => {
          const card = boardCards[cardId];
          if (card) {
            if (
              card.status === "completed" ||
              columnLower.includes("completado") ||
              columnLower.includes("ganado") ||
              columnLower.includes("cerrado")
            ) {
              completedTasks++;
            } else if (
              columnLower.includes("progreso") ||
              card.status === "in_progress"
            ) {
              inProgressTasks++;
            } else {
              pendingTasks++;
            }
          }
        });
      });
    });

    return { completedTasks, pendingTasks, inProgressTasks };
  }, [boardsList, refreshTrigger]);

  const completedData = monthNames.map((_, i) =>
    Math.floor(taskStats.completedTasks * (0.3 + i * 0.06))
  );
  const inProgressData = monthNames.map((_, i) =>
    Math.floor(taskStats.inProgressTasks * (0.5 + Math.sin(i / 2) * 0.3))
  );
  const pendingData = monthNames.map((_, i) =>
    Math.max(1, Math.floor(taskStats.pendingTasks * (1 - i * 0.05)))
  );

  const xAxisData = {
    scaleType: "band" as const,
    data: monthNames,
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
      <CardContent
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" component="h3">
            Progreso de Tareas
          </Typography>
          <ToggleButtonGroup
            size="small"
            value={timeRange}
            exclusive
            onChange={handleTimeRangeChange}
            aria-label="time range"
          >
            <ToggleButton value="month" aria-label="month view">
              Mes
            </ToggleButton>
            <ToggleButton value="quarter" aria-label="quarter view">
              Trimestre
            </ToggleButton>
            <ToggleButton value="year" aria-label="year view">
              Año
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        <Box sx={{ flexGrow: 1, width: "100%", height: "300px" }}>
          <BarChart
            series={[
              {
                data: completedData,
                label: "Completadas",
                color: theme.palette.success.main,
              },
              {
                data: inProgressData,
                label: "En Progreso",
                color: theme.palette.primary.main,
              },
              {
                data: pendingData,
                label: "Pendientes",
                color: theme.palette.grey[400],
              },
            ]}
            xAxis={[xAxisData]}
            yAxis={[
              {
                label: "Tareas",
              },
            ]}
            height={300}
            margin={{ top: 10, bottom: 30, left: 50, right: 10 }}
            slotProps={{
              legend: {
                position: { vertical: "top", horizontal: "center" },
                itemMarkWidth: 10,
                itemMarkHeight: 10,
                markGap: 5,
                itemGap: 10,
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
