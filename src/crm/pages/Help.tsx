import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import StorageRoundedIcon from "@mui/icons-material/StorageRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";

interface TableField {
  name: string;
  type: string;
  nullable?: boolean;
  primaryKey?: boolean;
  foreignKey?: string;
}

interface TableSchema {
  name: string;
  description: string;
  fields: TableField[];
}

const databaseSchema: TableSchema[] = [
  {
    name: "users",
    description: "Almacena la información de los usuarios del sistema",
    fields: [
      { name: "id", type: "UUID", primaryKey: true },
      { name: "name", type: "VARCHAR(255)" },
      { name: "email", type: "VARCHAR(255)" },
      { name: "avatar", type: "VARCHAR(500)" },
      { name: "department", type: "VARCHAR(100)" },
      { name: "join_date", type: "DATE" },
      { name: "role", type: "VARCHAR(50)" },
      { name: "created_at", type: "TIMESTAMP" },
      { name: "updated_at", type: "TIMESTAMP" },
    ],
  },
  {
    name: "boards",
    description: "Tableros Kanban para gestión de proyectos y tareas",
    fields: [
      { name: "id", type: "UUID", primaryKey: true },
      { name: "title", type: "VARCHAR(255)" },
      { name: "is_default", type: "BOOLEAN" },
      { name: "created_at", type: "TIMESTAMP" },
      { name: "updated_at", type: "TIMESTAMP" },
      { name: "created_by", type: "UUID", foreignKey: "users.id", nullable: true },
    ],
  },
  {
    name: "columns",
    description: "Columnas dentro de cada tablero Kanban",
    fields: [
      { name: "id", type: "UUID", primaryKey: true },
      { name: "board_id", type: "UUID", foreignKey: "boards.id" },
      { name: "title", type: "VARCHAR(255)" },
      { name: "position", type: "INTEGER" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
  {
    name: "cards",
    description: "Tarjetas de tareas o negocios dentro de las columnas",
    fields: [
      { name: "id", type: "UUID", primaryKey: true },
      { name: "column_id", type: "UUID", foreignKey: "columns.id" },
      { name: "title", type: "VARCHAR(255)" },
      { name: "description", type: "TEXT", nullable: true },
      { name: "customer", type: "VARCHAR(255)", nullable: true },
      { name: "value", type: "DECIMAL(15,2)", nullable: true },
      { name: "probability", type: "INTEGER", nullable: true },
      { name: "priority", type: "ENUM('alta','media','baja')", nullable: true },
      { name: "status", type: "ENUM('pending','in_progress','review','completed','overdue')", nullable: true },
      { name: "progress", type: "INTEGER", nullable: true },
      { name: "start_date", type: "DATE", nullable: true },
      { name: "due_date", type: "DATE", nullable: true },
      { name: "closing_date", type: "DATE", nullable: true },
      { name: "assignee_id", type: "UUID", foreignKey: "users.id", nullable: true },
      { name: "created_by", type: "UUID", foreignKey: "users.id", nullable: true },
      { name: "parent_id", type: "UUID", foreignKey: "cards.id", nullable: true },
      { name: "created_at", type: "TIMESTAMP" },
      { name: "updated_at", type: "TIMESTAMP" },
    ],
  },
  {
    name: "activity_logs",
    description: "Registro de actividades y cambios en el sistema",
    fields: [
      { name: "id", type: "UUID", primaryKey: true },
      { name: "user_id", type: "UUID", foreignKey: "users.id", nullable: true },
      { name: "timestamp", type: "TIMESTAMP" },
      { name: "action", type: "VARCHAR(100)" },
      { name: "entity", type: "VARCHAR(100)" },
      { name: "entity_id", type: "UUID", nullable: true },
      { name: "entity_name", type: "VARCHAR(255)" },
      { name: "details", type: "JSONB", nullable: true },
    ],
  },
  {
    name: "tasks",
    description: "Tareas pendientes y completadas",
    fields: [
      { name: "id", type: "UUID", primaryKey: true },
      { name: "task", type: "TEXT" },
      { name: "completed", type: "BOOLEAN" },
      { name: "priority", type: "ENUM('alta','media','baja')" },
      { name: "due_date", type: "TIMESTAMP", nullable: true },
      { name: "assignee_id", type: "UUID", foreignKey: "users.id", nullable: true },
      { name: "created_at", type: "TIMESTAMP" },
      { name: "updated_at", type: "TIMESTAMP" },
    ],
  },
  {
    name: "activities",
    description: "Registro de actividades como correos, llamadas y reuniones",
    fields: [
      { name: "id", type: "UUID", primaryKey: true },
      { name: "type", type: "ENUM('email','call','meeting','note')" },
      { name: "title", type: "VARCHAR(255)" },
      { name: "description", type: "TEXT", nullable: true },
      { name: "time", type: "TIMESTAMP" },
      { name: "user_id", type: "UUID", foreignKey: "users.id", nullable: true },
      { name: "related_entity", type: "VARCHAR(100)", nullable: true },
      { name: "related_entity_id", type: "UUID", nullable: true },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
  {
    name: "customers",
    description: "Clientes y prospectos del CRM",
    fields: [
      { name: "id", type: "UUID", primaryKey: true },
      { name: "name", type: "VARCHAR(255)" },
      { name: "email", type: "VARCHAR(255)", nullable: true },
      { name: "phone", type: "VARCHAR(50)", nullable: true },
      { name: "company", type: "VARCHAR(255)", nullable: true },
      { name: "status", type: "VARCHAR(50)" },
      { name: "assigned_to", type: "UUID", foreignKey: "users.id", nullable: true },
      { name: "created_at", type: "TIMESTAMP" },
      { name: "updated_at", type: "TIMESTAMP" },
    ],
  },
];

function TableSchemaCard({ table }: { table: TableSchema }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <TableChartRoundedIcon color="primary" />
          <Typography variant="h6" component="h3" fontWeight="bold">
            {table.name}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {table.description}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={1}>
          {table.fields.map((field, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                py: 0.5,
                px: 1,
                borderRadius: 1,
                bgcolor: field.primaryKey ? "primary.50" : "transparent",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  variant="body2"
                  fontFamily="monospace"
                  fontWeight={field.primaryKey ? "bold" : "normal"}
                >
                  {field.name}
                </Typography>
                {field.primaryKey && (
                  <Chip label="PK" size="small" color="primary" sx={{ height: 20, fontSize: "0.65rem" }} />
                )}
                {field.foreignKey && (
                  <Chip
                    label={`FK → ${field.foreignKey}`}
                    size="small"
                    color="secondary"
                    variant="outlined"
                    sx={{ height: 20, fontSize: "0.65rem" }}
                  />
                )}
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                  {field.type}
                </Typography>
                {field.nullable && (
                  <Typography variant="caption" color="text.disabled">
                    NULL
                  </Typography>
                )}
              </Stack>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function DatabaseRelationshipDiagram() {
  return (
    <Card sx={{ p: 3, mb: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <AccountTreeRoundedIcon color="primary" />
        <Typography variant="h6" fontWeight="bold">
          Relaciones entre Tablas
        </Typography>
      </Stack>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          p: 2,
          bgcolor: "background.default",
          borderRadius: 2,
          overflowX: "auto",
        }}
      >
        <svg width="700" height="400" viewBox="0 0 700 400">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
            </marker>
          </defs>
          
          <rect x="20" y="30" width="120" height="60" rx="8" fill="#1976d2" opacity="0.9" />
          <text x="80" y="55" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">users</text>
          <text x="80" y="75" textAnchor="middle" fill="white" fontSize="10">Usuarios</text>
          
          <rect x="200" y="30" width="120" height="60" rx="8" fill="#2e7d32" opacity="0.9" />
          <text x="260" y="55" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">boards</text>
          <text x="260" y="75" textAnchor="middle" fill="white" fontSize="10">Tableros</text>
          
          <rect x="380" y="30" width="120" height="60" rx="8" fill="#ed6c02" opacity="0.9" />
          <text x="440" y="55" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">columns</text>
          <text x="440" y="75" textAnchor="middle" fill="white" fontSize="10">Columnas</text>
          
          <rect x="560" y="30" width="120" height="60" rx="8" fill="#9c27b0" opacity="0.9" />
          <text x="620" y="55" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">cards</text>
          <text x="620" y="75" textAnchor="middle" fill="white" fontSize="10">Tarjetas</text>
          
          <rect x="20" y="150" width="120" height="60" rx="8" fill="#0288d1" opacity="0.9" />
          <text x="80" y="175" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">tasks</text>
          <text x="80" y="195" textAnchor="middle" fill="white" fontSize="10">Tareas</text>
          
          <rect x="200" y="150" width="120" height="60" rx="8" fill="#d32f2f" opacity="0.9" />
          <text x="260" y="175" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">activities</text>
          <text x="260" y="195" textAnchor="middle" fill="white" fontSize="10">Actividades</text>
          
          <rect x="380" y="150" width="120" height="60" rx="8" fill="#7b1fa2" opacity="0.9" />
          <text x="440" y="175" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">activity_logs</text>
          <text x="440" y="195" textAnchor="middle" fill="white" fontSize="10">Logs</text>
          
          <rect x="560" y="150" width="120" height="60" rx="8" fill="#00796b" opacity="0.9" />
          <text x="620" y="175" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">customers</text>
          <text x="620" y="195" textAnchor="middle" fill="white" fontSize="10">Clientes</text>
          
          <line x1="140" y1="60" x2="195" y2="60" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <line x1="320" y1="60" x2="375" y2="60" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <line x1="500" y1="60" x2="555" y2="60" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
          
          <line x1="80" y1="90" x2="80" y2="145" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <line x1="80" y1="90" x2="200" y2="150" stroke="#666" strokeWidth="1.5" strokeDasharray="5,5" />
          <line x1="80" y1="90" x2="380" y2="150" stroke="#666" strokeWidth="1.5" strokeDasharray="5,5" />
          <line x1="80" y1="90" x2="560" y2="150" stroke="#666" strokeWidth="1.5" strokeDasharray="5,5" />
          
          <line x1="620" y1="90" x2="620" y2="145" stroke="#666" strokeWidth="1.5" strokeDasharray="5,5" />
          
          <rect x="20" y="280" width="660" height="100" rx="8" fill="#f5f5f5" stroke="#ccc" />
          <text x="40" y="310" fill="#333" fontSize="12" fontWeight="bold">Leyenda:</text>
          <line x1="40" y1="335" x2="80" y2="335" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <text x="90" y="340" fill="#666" fontSize="11">Relación directa (FK)</text>
          <line x1="250" y1="335" x2="290" y2="335" stroke="#666" strokeWidth="1.5" strokeDasharray="5,5" />
          <text x="300" y="340" fill="#666" fontSize="11">Relación opcional</text>
          <rect x="480" y="325" width="20" height="20" rx="4" fill="#1976d2" />
          <text x="510" y="340" fill="#666" fontSize="11">Tabla principal</text>
        </svg>
      </Box>
    </Card>
  );
}

export default function Help() {
  return (
    <Box sx={{ width: "100%", maxWidth: { sm: "100%", md: "1700px" } }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
        <StorageRoundedIcon sx={{ fontSize: 32 }} color="primary" />
        <Typography component="h1" variant="h4" fontWeight="bold">
          Ayuda y Soporte
        </Typography>
      </Stack>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Estructura de la base de datos del sistema CRM. A continuación se muestra el esquema 
        completo con todas las tablas, campos y relaciones necesarias para el funcionamiento del sistema.
      </Typography>

      <DatabaseRelationshipDiagram />

      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Esquema de Tablas
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          },
          gap: 3,
        }}
      >
        {databaseSchema.map((table, index) => (
          <Box key={index}>
            <TableSchemaCard table={table} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
