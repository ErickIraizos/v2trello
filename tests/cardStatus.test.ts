import { describe, it, expect } from "vitest";

interface Card {
  id: string;
  title: string;
  status?: string;
  dueDate?: string;
}

interface Column {
  id: string;
  title: string;
  cardIds: string[];
}

function determinarStatus(card: Partial<Card>, column: Column): string {
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

  if (columnLower.includes("revisión") || columnLower.includes("revision")) {
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
}

describe("Prueba 2: Lógica de determinación de estado de tarjetas", () => {
  describe("Determinación por nombre de columna", () => {
    it("debe retornar 'completed' para columnas con 'Completado'", () => {
      const card = { id: "1", title: "Test", status: "pending" };
      const column = { id: "1", title: "Completado", cardIds: [] };
      expect(determinarStatus(card, column)).toBe("completed");
    });

    it("debe retornar 'completed' para columnas con 'Cerrado Ganado'", () => {
      const card = { id: "1", title: "Test", status: "pending" };
      const column = { id: "1", title: "Cerrado Ganado", cardIds: [] };
      expect(determinarStatus(card, column)).toBe("completed");
    });

    it("debe retornar 'in_progress' para columnas con 'En Progreso'", () => {
      const card = { id: "1", title: "Test", status: "pending" };
      const column = { id: "1", title: "En Progreso", cardIds: [] };
      expect(determinarStatus(card, column)).toBe("in_progress");
    });

    it("debe retornar 'review' para columnas con 'Revisión'", () => {
      const card = { id: "1", title: "Test", status: "pending" };
      const column = { id: "1", title: "Revisión Final", cardIds: [] };
      expect(determinarStatus(card, column)).toBe("review");
    });

    it("debe retornar 'review' para columnas con 'revision' (sin tilde)", () => {
      const card = { id: "1", title: "Test", status: "pending" };
      const column = { id: "1", title: "En revision", cardIds: [] };
      expect(determinarStatus(card, column)).toBe("review");
    });
  });

  describe("Determinación por fecha de vencimiento", () => {
    it("debe retornar 'overdue' si la fecha de vencimiento pasó", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const card = {
        id: "1",
        title: "Test",
        status: "pending",
        dueDate: yesterday.toISOString().split("T")[0],
      };
      const column = { id: "1", title: "Planeación", cardIds: [] };
      expect(determinarStatus(card, column)).toBe("overdue");
    });

    it("no debe marcar como overdue si la tarjeta está completada", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const card = {
        id: "1",
        title: "Test",
        status: "completed",
        dueDate: yesterday.toISOString().split("T")[0],
      };
      const column = { id: "1", title: "Completado", cardIds: [] };
      expect(determinarStatus(card, column)).toBe("completed");
    });

    it("no debe marcar como overdue si la fecha es futura", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const card = {
        id: "1",
        title: "Test",
        status: "pending",
        dueDate: tomorrow.toISOString().split("T")[0],
      };
      const column = { id: "1", title: "Planeación", cardIds: [] };
      expect(determinarStatus(card, column)).toBe("pending");
    });
  });

  describe("Casos edge", () => {
    it("debe usar el estado de la tarjeta si no hay coincidencia de columna", () => {
      const card = { id: "1", title: "Test", status: "in_progress" };
      const column = { id: "1", title: "Sin coincidencias", cardIds: [] };
      expect(determinarStatus(card, column)).toBe("in_progress");
    });

    it("debe retornar 'pending' si no hay estado ni coincidencia", () => {
      const card = { id: "1", title: "Test" };
      const column = { id: "1", title: "Sin coincidencias", cardIds: [] };
      expect(determinarStatus(card, column)).toBe("pending");
    });
  });
});
