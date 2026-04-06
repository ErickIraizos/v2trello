# Actividad 4: Mejora Funcional - Sistema de Tareas (To-Do List) 📋

## Resumen

Se implementó un sistema completo de gestión de tareas pendientes integrado en el módulo CRM.

---

## Funcionalidades Implementadas

### 1. Agregar Nueva Tarea

- Formulario con título (obligatorio), descripción (opcional) y prioridad
- **Validación**: Título requerido, mínimo 3 caracteres
- Alertas de error visuales

### 2. Listar Tareas Pendientes

- Lista completa de tareas con estados visuales
- Indicadores de prioridad (alta/media/baja) con colores
- Descripción truncada para mejor legibilidad

### 3. Marcar Tarea como Completada

- Toggle checkbox para cambiar estado
- Estilo visual diferenciado (tachado, opacidad reducida)
- Icono verde de check

### 4. Validación de Datos

- No permite título vacío
- Muestra mensaje de error con Alert de Material UI
- Validación en tiempo real

---

## Archivos Creados/Modificados

| Archivo                   | Tipo       | Descripción                                   |
| ------------------------- | ---------- | --------------------------------------------- |
| `src/crm/pages/Tasks.tsx` | Modificado | Implementación completa del sistema de tareas |

### Estructura del Componente

```typescript
interface TodoItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: "alta" | "media" | "baja";
  createdAt: string;
}
```

---

## Características Adicionales

### Persistencia

- Datos almacenados en `localStorage` con clave `crm_todos`
- Persiste entre sesiones del navegador

### Estadísticas

- Contador total de tareas
- Contador de pendientes
- Contador de completadas

### Filtros y Búsqueda

- **Búsqueda**: Filtra por título o descripción
- **Filtro**: Todas / Pendientes / Completadas
- **Limpiar completadas**: Botón para eliminar tareas finalizadas

### Datos de Ejemplo

```typescript
const initialTodos = [
  {
    title: "Revisar proposals de clientes",
    priority: "alta",
    completed: false,
  },
  {
    title: "Actualizar CRM con nuevos contactos",
    priority: "media",
    completed: false,
  },
  {
    title: "Preparar presentación trimestral",
    priority: "alta",
    completed: true,
  },
];
```

---

## Capturas de Pantalla (Descripción)

```
┌─────────────────────────────────────────────┐
│  Mis Tareas                                 │
│  ─────────────────────────────────────────  │
│  [Total: 3] [Pendientes: 2] [Completadas: 1]│
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Nueva Tarea                          │   │
│  │ [Título________] [Descripción____]  │   │
│  │ [Prioridad ▼] [Agregar Tarea]       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Buscar...] [Filtrar ▼] [Limpiar complet.] │
│  ─────────────────────────────────────────  │
│  ☐ Revisar proposals           [Alta]  🗑   │
│  ☐ Actualizar CRM               [Media] 🗑   │
│  ☑ Preparar presentación       [Alta]  🗑   │
└─────────────────────────────────────────────┘
```

---

## Código Destacado

### Validación

```typescript
const handleAddTodo = () => {
  setError(null);

  if (!trimmedTitle) {
    setError("El título de la tarea es requerido");
    return;
  }

  if (trimmedTitle.length < 3) {
    setError("El título debe tener al menos 3 caracteres");
    return;
  }
  // ...
};
```

### Toggle Completado

```typescript
const handleToggleComplete = (id: string) => {
  setTodos(
    todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo,
    ),
  );
};
```

---

## Integración

El componente está disponible en la ruta `/tasks` del CRM, accesible desde el menú lateral.

---

## Próximas Mejoras Posibles

1. **Editar tareas existentes**
2. **Fecha de vencimiento**
3. **Categorías/etiquetas**
4. **Notificaciones de recordatorio**
5. **Drag & drop para reordenar**
6. **Exportar a CSV**
7. **Sincronización con backend**
