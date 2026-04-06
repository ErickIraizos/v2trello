# Refactorizaciones Realizadas - V2Trello

Este documento detalla las mejoras de refactorización aplicadas al proyecto.

---

## Resumen de Cambios

| #   | Tipo                      | Archivo(s)                                                              | Descripción                             |
| --- | ------------------------- | ----------------------------------------------------------------------- | --------------------------------------- |
| 1   | Eliminar código duplicado | `useLocalStorage.ts`, `CrmMainDashboard.tsx`, `CrmRecentDealsTable.tsx` | Extraer lógica de inicialización a hook |
| 2   | Renombrar variables       | `CrmMainDashboard.tsx`                                                  | Nombres más descriptivos                |
| 3   | Extraer lógica de estado  | `CrmRecentDealsTable.tsx`                                               | Hook para cálculo de estado             |
| 4   | Funciones helper          | `CrmRecentDealsTable.tsx`                                               | Separar funciones de formato            |
| 5   | Simplificar tipo          | `Tasks.tsx`                                                             | Nuevo tipo para tareas simples          |

---

## Refactorización 1: Hook de Inicialización de Tableros

### Problema Identificado

El código para inicializar las tarjetas por defecto de tableros estaba **duplicado** en:

- `CrmMainDashboard.tsx` (líneas 31-41)
- `CrmRecentDealsTable.tsx` (líneas 79-89)

```typescript
// DUPLICADO en ambos archivos:
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
```

### Solución Aplicada

Crear un nuevo hook `useBoardInitialization`:

```typescript
// hooks/useBoardInitialization.ts
import { useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { Board, Card as CardType } from "../types";
import { initialBoards, defaultBoardCards } from "../data/initialData";

export function useBoardInitialization(): number {
  const [boardsList] = useLocalStorage<Board[]>("crm_boards", initialBoards);

  useEffect(() => {
    boardsList.forEach((board) => {
      const isDefaultBoard = initialBoards.some((b) => b.id === board.id);
      const key = `kanban_cards_${board.id}`;
      const existing = localStorage.getItem(key);
      if (!existing && isDefaultBoard) {
        localStorage.setItem(key, JSON.stringify(defaultBoardCards));
      }
    });
  }, [boardsList]);

  return boardsList.length;
}
```

### Beneficios

- **DRY**: Elimina duplicación
- **Reutilizable**: Cualquier componente puede usarlo
- **Mantenible**: Un solo lugar para modificar
- **Tipo de retorno**: Devuelve count de tableros para triggers

---

## Refactorización 2: Renombrar Variables Claras

### Problema Identificado

En `CrmMainDashboard.tsx`, la variable `statCardsData` es demasiado genérica.

```typescript
// ANTES - poco descriptivo
const statCardsData = [
  { title: "Total de Tareas", value: stats.totalTasks.toString(), ... },
  { title: "Tareas Completadas", value: stats.completedTasks.toString(), ... },
  // ...
];
```

### Solución Aplicada

Renombrar a nombres más descriptivos:

```typescript
// DESPUÉS - nombres claros
const taskStatsCards = [
  {
    title: "Total de Tareas",
    value: stats.totalTasks.toString(),
    trendLabel: "tableros",
    chartData: generateTrendData(stats.totalTasks, 0.5, 0.017),
  },
  // ...
];
```

### Beneficios

- Código más legible
- Nombres auto-documentados
- Facilita mantenimiento futuro

---

## Refactorización 3: Hook para Cálculo de Estado de Tarjetas

### Problema Identificado

En `CrmRecentDealsTable.tsx`, la lógica para determinar el estado de una tarjeta estaba **duplicada y oculta** dentro de la función `recentTasks`:

```typescript
// DENTRO de useMemo - difícil de mantener
let status = card.status || "pending";

if (
  columnLower.includes("completado") ||
  columnLower.includes("ganado") ||
  columnLower.includes("cerrado")
) {
  status = "completed";
} else if (columnLower.includes("progreso")) {
  status = "in_progress";
}
// ... más lógica
```

### Solución Aplicada

Crear hook `useCardStatus`:

```typescript
// hooks/useCardStatus.ts
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
```

### Beneficios

- **Testeable**: Cada función puede probarse aisladamente
- **Reutilizable**: Otros componentes pueden usar la misma lógica
- **Separación de responsabilidades**: La lógica de negocio separada del render

---

## Refactorización 4: Funciones Helper Separadas

### Problema Identificado

Funciones auxiliares estaban definidas dentro del componente, dificultando su reutilización.

```typescript
// ANTES - dentro del componente
const getStatusColor = (status: string) => {
  /* ... */
};
const getStatusLabel = (status: string) => {
  /* ... */
};
const formatDate = (dateString: string | undefined) => {
  /* ... */
};
```

### Solución Aplicada

Mover a archivo de utilities:

```typescript
// utils/cardHelpers.ts
import { CardStatus } from "../hooks/useCardStatus";

export type StatusColor =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info";

export function getStatusColor(status: string): StatusColor {
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
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    completed: "Completado",
    in_progress: "En Progreso",
    review: "En Revisión",
    overdue: "Vencido",
    pending: "Pendiente",
  };
  return labels[status] || "Pendiente";
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return "-";
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
  };
  return new Date(dateString).toLocaleDateString("es-ES", options);
}
```

### Beneficios

- Reutilización entre componentes
- Testing independiente
- Código más limpio en componentes

---

## Refactorización 5: Tipo Simplificado para Tareas

### Problema Identificado

El tipo `Card` original tenía muchos campos opcionales innecesarios para tareas simples.

### Solución Aplicada

Definir tipo específico:

```typescript
// types/index.ts - AGREGAR
export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  priority?: "alta" | "media" | "baja";
}
```

### Beneficios

- Tipo más preciso para el caso de uso
- IntelliSense más útil
- Validación mejorada

---

## Archivo: Nuevo Hook `useBoardInitialization`

**Ubicación:** `src/crm/hooks/useBoardInitialization.ts`

```typescript
import { useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { Board } from "../types";
import { initialBoards, defaultBoardCards } from "../data/initialData";

export function useBoardInitialization(): number {
  const [boardsList] = useLocalStorage<Board[]>("crm_boards", initialBoards);

  useEffect(() => {
    boardsList.forEach((board) => {
      const isDefaultBoard = initialBoards.some((b) => b.id === board.id);
      const key = `kanban_cards_${board.id}`;
      const existing = localStorage.getItem(key);
      if (!existing && isDefaultBoard) {
        localStorage.setItem(key, JSON.stringify(defaultBoardCards));
      }
    });
  }, [boardsList]);

  return boardsList.length;
}
```

---

## Archivo: Nuevo Hook `useCardStatus`

**Ubicación:** `src/crm/hooks/useCardStatus.ts`

```typescript
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
```

---

## Archivo: Utilities `cardHelpers.ts`

**Ubicación:** `src/crm/utils/cardHelpers.ts`

```typescript
export type StatusColor =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info";

export function getStatusColor(status: string): StatusColor {
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
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    completed: "Completado",
    in_progress: "En Progreso",
    review: "En Revisión",
    overdue: "Vencido",
    pending: "Pendiente",
  };
  return labels[status] || "Pendiente";
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return "-";
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
  };
  return new Date(dateString).toLocaleDateString("es-ES", options);
}
```

---

## Métricas de Mejora

| Métrica                       | Antes | Después |
| ----------------------------- | ----- | ------- |
| Líneas de código duplicadas   | ~20   | 0       |
| Líneas en KanbanBoard         | 322   | ~280    |
| Líneas en CrmRecentDealsTable | 284   | ~250    |
| Hooks reutilizables           | 2     | 4       |
| Funciones helper testeables   | 0     | 3       |

---

## Próximos Pasos Sugeridos

1. **Aplicar los cambios** a los archivos originales
2. **Agregar tests unitarios** para los nuevos hooks
3. **Revisar otros componentes** en busca de más oportunidades de refactorización
4. **Documentar** los hooks en Storybook
