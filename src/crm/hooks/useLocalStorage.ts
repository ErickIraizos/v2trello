import { useState, useEffect, useCallback } from 'react';

const STORAGE_CHANGE_EVENT = 'crm-storage-change';

export function emitStorageChange(key: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT, { detail: { key } }));
  }
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
        emitStorageChange(key);
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue];
}

export function useStorageListener(callback: () => void) {
  useEffect(() => {
    const handleStorageChange = () => {
      callback();
    };

    window.addEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
    return () => {
      window.removeEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
    };
  }, [callback]);
}
