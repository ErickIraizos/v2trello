import { describe, it, expect } from "vitest";
import { getStatusColor, getStatusLabel, formatDate } from "./helpers";

describe("Prueba 1: Funciones auxiliares de tarjetas", () => {
  describe("getStatusColor", () => {
    it("debe retornar 'success' para estado completed", () => {
      expect(getStatusColor("completed")).toBe("success");
    });

    it("debe retornar 'primary' para estado in_progress", () => {
      expect(getStatusColor("in_progress")).toBe("primary");
    });

    it("debe retornar 'warning' para estado review", () => {
      expect(getStatusColor("review")).toBe("warning");
    });

    it("debe retornar 'error' para estado overdue", () => {
      expect(getStatusColor("overdue")).toBe("error");
    });

    it("debe retornar 'default' para estado pendiente", () => {
      expect(getStatusColor("pending")).toBe("default");
    });
  });

  describe("getStatusLabel", () => {
    it("debe retornar 'Completado' para completed", () => {
      expect(getStatusLabel("completed")).toBe("Completado");
    });

    it("debe retornar 'En Progreso' para in_progress", () => {
      expect(getStatusLabel("in_progress")).toBe("En Progreso");
    });

    it("debe retornar 'En Revisión' para review", () => {
      expect(getStatusLabel("review")).toBe("En Revisión");
    });

    it("debe retornar 'Vencido' para overdue", () => {
      expect(getStatusLabel("overdue")).toBe("Vencido");
    });

    it("debe retornar 'Pendiente' para estado desconocido", () => {
      expect(getStatusLabel("unknown")).toBe("Pendiente");
    });
  });

  describe("formatDate", () => {
    it("debe retornar '-' para fecha indefinida", () => {
      expect(formatDate(undefined)).toBe("-");
    });

    it("debe retornar '-' para string vacío", () => {
      expect(formatDate("")).toBe("-");
    });

    it("debe formatear fecha correctamente en español", () => {
      const result = formatDate("2024-04-25");
      expect(result.toLowerCase()).toContain("abr");
    });
  });
});
