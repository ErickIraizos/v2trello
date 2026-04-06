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
