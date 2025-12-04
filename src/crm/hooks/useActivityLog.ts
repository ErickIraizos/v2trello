import { useLocalStorage } from './useLocalStorage';
import { ActivityLog } from '../types';

export function useActivityLog() {
  const [logs, setLogs] = useLocalStorage<ActivityLog[]>('activity_logs', []);

  const addLog = (action: string, entity: string, entityName: string, entityId?: string, details?: Record<string, any>) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      entity,
      entityId,
      entityName,
      details,
    };
    setLogs([newLog, ...logs]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return { logs, addLog, clearLogs };
}
