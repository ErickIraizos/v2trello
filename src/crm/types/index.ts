export interface Card {
  id: string;
  title: string;
  description: string;
  customer?: string;
  value?: number;
  probability?: number;
  closingDate?: string;
  priority?: 'alta' | 'media' | 'baja';
  assignee?: string;
  startDate?: string;
  dueDate?: string;
  createdBy?: string;
}

export interface Column {
  id: string;
  title: string;
  cardIds: string[];
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
  createdAt: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  department: string;
  joinDate: string;
  role: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  entity: string;
  entityId?: string;
  entityName: string;
  details?: Record<string, any>;
}
