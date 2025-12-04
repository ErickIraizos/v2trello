# Material UI - Vite Example with Tailwind CSS

## Overview
This is a Material UI showcase application built with React, TypeScript, Vite, and Tailwind CSS. It demonstrates various Material UI components and patterns through multiple example pages including a CRM Dashboard, Blog, Checkout flow, Marketing pages, and authentication pages.

**Current State**: Successfully configured and running in Replit environment. The CRM Dashboard is the default landing page.

## Recent Changes
- **December 4, 2025**: Complete dashboard transformation to task management theme
  - Transformed CrmMainDashboard from sales/CRM theme to task management theme
  - Updated stat cards: Total de Tareas, Tareas Completadas, En Progreso, Tareas Vencidas
  - Changed CrmSalesChart to show "Progreso de Tareas" with Completadas/En Progreso/Pendientes bars
  - Changed CrmLeadsBySourceChart to show "Tareas por Estado" pie chart with status distribution
  - Updated CrmRecentDealsTable to show recent tasks instead of deals
  - Added "Nueva Tarea" and "Nuevo Tablero" buttons to the header
  - Fixed LSP/TypeScript errors in chart components

- **December 4, 2025**: Cronograma (Schedule) complete redesign as Gantt Chart
  - Redesigned as professional Gantt chart with timeline visualization
  - Added task IDs (TBT-XX format) for each task
  - Added checkboxes to mark tasks as completed/pending
  - Implemented clickable progress bars - click anywhere on the bar to adjust progress
  - Added editable task status (pending, in progress, review, completed, overdue)
  - Added user avatars on progress bars showing task creator
  - Implemented hierarchical task structure with parent/child relationships
  - Added expand/collapse functionality for task groups
  - Added view mode toggle (Weeks, Months, Quarters)
  - Added edit dialog with progress slider and status dropdown
  - Added Card types with progress, status, parentId, subtasks fields

- **December 4, 2025**: Critical bug fixes and enhancements
  - Fixed useLocalStorage hook to re-read from storage when key changes (root cause of cards disappearing when switching boards)
  - Calendar: Removed window.location.reload() - now uses proper state management with custom storage events
  - Calendar: Replaced deprecated MUI Grid with CSS Grid layout
  - Calendar: Added "Today" button and "Remove Date" feature
  - Schedule (Cronograma): Added stats cards, filtering by board/status, improved timeline visualization
  - Fixed TypeScript type consistency across handlers
  
- **December 4, 2025**: Initial Replit setup completed
  - Configured Vite to bind to 0.0.0.0:5000 for Replit proxy compatibility
  - Set up HMR with clientPort 443 for hot module replacement
  - Installed all npm dependencies
  - Configured deployment for static site hosting
  - Verified application runs successfully

## Project Architecture

### Tech Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material UI v7
- **Styling**: Emotion (MUI default) + Tailwind CSS
- **Routing**: React Router DOM v7
- **Charts**: MUI X Charts
- **Data Grid**: MUI X Data Grid Pro
- **Date Handling**: Day.js with MUI X Date Pickers
- **Animations**: React Spring

### Project Structure
```
src/
├── crm/              - CRM Dashboard (default route)
├── dashboard/        - General dashboard example
├── blog/            - Blog layout example
├── checkout/        - Checkout flow example
├── marketing-page/  - Marketing landing page
├── sign-in/         - Sign-in page
├── sign-in-side/    - Sign-in with side image
├── sign-up/         - Sign-up page
├── shared-theme/    - Shared theme customizations
├── App.tsx          - Main routing configuration
└── main.tsx         - Application entry point
```

### Key Configuration Files
- `vite.config.ts` - Vite configuration with Replit-specific settings
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration

## Development Workflow

### Available Scripts
- `npm run dev` - Start development server on port 5000
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Running the Application
The application is configured to run automatically via the "Start application" workflow. It binds to `0.0.0.0:5000` to work with Replit's proxy system.

### Hot Module Replacement
Vite HMR is configured with `clientPort: 443` to work properly within Replit's environment.

## Deployment
The project is configured for static deployment:
- Build command: `npm run build`
- Output directory: `dist`
- Deployment type: Static site

## Notes
- The default route (`/*`) loads the CRM Dashboard
- All example pages are accessible through their respective navigation
- Some MUI Grid deprecation warnings are present (Grid v2 migration needed)
- The application uses Spanish language for the CRM interface text
