# V2Trello - Sistema CRM

> Sistema de gestión de relaciones con clientes (CRM) basado en tableros Kanban

## Instalación

```bash
npm install
npm run dev
```

## 1. Tipo de Arquitectura

### Arquitectura actual: **Component-Based con Gestión de Estado Distribuida**

El proyecto utiliza una arquitectura basada en componentes de React con las siguientes características:

| Aspecto           | Descripción                                              |
| ----------------- | -------------------------------------------------------- |
| **Patrón UI**     | Component-Based Architecture                             |
| **Estado Global** | localStorage + Custom Events (sin Redux/Zustand/Context) |
| **Routing**       | React Router DOM v7 (client-side routing)                |
| **UI Framework**  | Material UI v7 con tema personalizado                    |
| **Build Tool**    | Vite                                                     |
| **Paradigma**     | TypeScript con tipado estático                           |

---

## 2. Módulos y Componentes Identificados

### Módulos Principales

| Módulo        | Ruta                             | Descripción                         |
| ------------- | -------------------------------- | ----------------------------------- |
| **CRM**       | `/src/crm/`                      | Módulo principal de gestión CRM     |
| **Dashboard** | `/src/dashboard/`                | Componentes genéricos reutilizables |
| **Blog**      | `/src/blog/`                     | Módulo de blog (plantilla)          |
| **Checkout**  | `/src/checkout/`                 | Flujo de checkout (plantilla)       |
| **Marketing** | `/src/marketing-page/`           | Landing page (plantilla)            |
| **Auth**      | `/src/sign-in/`, `/src/sign-up/` | Páginas de autenticación            |

### Estructura del Módulo CRM

```
src/crm/
├── CrmDashboard.tsx          # Layout principal con navegación
├── components/               # 23 componentes UI
│   ├── KanbanBoard.tsx       # Tablero Kanban completo
│   ├── KanbanColumn.tsx      # Columna individual
│   ├── KanbanCard.tsx        # Tarjeta de tarea
│   ├── CrmMainDashboard.tsx  # Dashboard principal
│   ├── CrmStatCard.tsx       # Tarjetas de estadísticas
│   ├── CrmSalesChart.tsx     # Gráfico de ventas
│   └── ...
├── pages/                    # 12 páginas
│   ├── Tables.tsx            # Gestión de tableros
│   ├── Calendar.tsx          # Vista de calendario
│   ├── Schedule.tsx         # Cronograma Gantt
│   ├── Tasks.tsx             # Gestión de tareas
│   └── ...
├── hooks/                    # 2 hooks personalizados
│   ├── useLocalStorage.ts    # Persistencia en localStorage
│   └── useActivityLog.ts     # Registro de actividades
├── types/                    # Definiciones TypeScript
│   └── index.ts              # Card, Board, Column, User, ActivityLog
└── data/                     # Datos iniciales
    └── initialData.ts        # Tableros y tarjetas de ejemplo
```

### Hooks Personalizados

| Hook              | Propósito                                                |
| ----------------- | -------------------------------------------------------- |
| `useLocalStorage` | Persistencia y sincronización de estado con localStorage |
| `useActivityLog`  | Registro de actividades del sistema                      |

---

## 3. Mejoras Arquitectónicas Propuestas

### Prioridad Alta

#### 1. **Estado Global con Context API o Zustand**

**Problema actual:** El estado se maneja con localStorage + eventos custom, lo que genera código verbose y prop drilling.

**Solución propuesta:**

```typescript
// Ejemplo con Context API
interface AppState {
  boards: Board[];
  cards: Record<string, Card>;
  users: User[];
}

// O con Zustand (más liviano)
// import { create } from 'zustand';
// const useStore = create((set) => ({
//   boards: [],
//   addBoard: (board) => set(state => ({ boards: [...state.boards, board] })),
// }));
```

#### 2. **Composable Hooks para Lógica de Negocio**

**Problema actual:** La lógica de cálculo de estadísticas y estados está duplicada.

**Solución propuesta:**

```typescript
// hooks/useBoardStats.ts
export function useBoardStats() {
  // Toda la lógica de cálculo de stats en un solo lugar
}

// hooks/useCardStatus.ts
export function useCardStatus(card: Card, column: Column) {
  // Lógica centralizada para determinar estado
}
```

#### 3. **Separación de Componentes de Formulario**

**Problema actual:** Los diálogos de creación/edición están inline en KanbanBoard.tsx (322 líneas).

**Solución propuesta:**

```
components/
├── KanbanBoard/
│   ├── KanbanBoard.tsx       # Solo lógica de render
│   ├── KanbanBoardForm.tsx   # Formulario de tarjeta
│   ├── KanbanBoardHeader.tsx # Encabezado con acciones
│   └── index.ts
```
