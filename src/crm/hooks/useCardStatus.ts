import { useCallback } from "react";
import { Card, Column } from "../types";

export type CardStatus =
  | "pending"
  | "in_progress"
  | "review"
  | "completed"
  | "overdue";

export function useCardStatus() {
  const determineStatus = useCallback(
    (card: Card, column: Column): CardStatus => {
      const columnLower = column.title.toLowerCase();
      let status = card.status || "pending";

      if (
        columnLower.includes("completado") ||
        columnLower.includes("ganado") ||
        columnLower.includes("cerrado")
      ) {
        return "completed";
      }

      if (columnLower.includes("progreso")) {
        return "in_progress";
      }

      if (
        columnLower.includes("revisión") ||
        columnLower.includes("revision")
      ) {
        return "review";
      }

      if (card.dueDate && status !== "completed") {
        const dueDate = new Date(card.dueDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        if (dueDate < now) {
          return "overdue";
        }
      }

      return status;
    },
    [],
  );

  return { determineStatus };
}
