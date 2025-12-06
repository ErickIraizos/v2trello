import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface Notification {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
  type: "info" | "success" | "warning" | "error";
  link?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "createdAt" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const initialNotifications: Notification[] = [
  {
    id: "1",
    title: "Nueva tarea asignada",
    body: "Se te ha asignado la tarea 'Revisión de propuesta para Acme Corp'",
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
    type: "info",
    link: "/lists",
  },
  {
    id: "2",
    title: "Reunión en 30 minutos",
    body: "Recordatorio: Reunión con el equipo de ventas a las 3:00 PM",
    read: false,
    createdAt: new Date(Date.now() - 25 * 60 * 1000),
    type: "warning",
    link: "/calendar",
  },
  {
    id: "3",
    title: "Tarea completada",
    body: "María García completó la tarea 'Preparar presentación Q4'",
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: "success",
  },
  {
    id: "4",
    title: "Nuevo comentario",
    body: "Juan López comentó en 'Proyecto de Rediseño de Sitio Web'",
    read: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    type: "info",
    link: "/tables",
  },
  {
    id: "5",
    title: "Fecha límite próxima",
    body: "La tarea 'Enviar documentos a Acme Corp' vence mañana",
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    type: "warning",
  },
  {
    id: "6",
    title: "Negocio cerrado",
    body: "¡Felicidades! El negocio con TechSolutions Inc se cerró exitosamente",
    read: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    type: "success",
  },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "createdAt" | "read">) => {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        createdAt: new Date(),
        read: false,
      };
      setNotifications((prev) => [newNotification, ...prev]);
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
