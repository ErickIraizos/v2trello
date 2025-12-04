import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_CHANGE_EVENT = 'crm-storage-change';

export function emitStorageChange(key: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT, { detail: { key } }));
  }
}

function readFromStorage<T>(key: string, initialValue: T): T {
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
}

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const initialValueRef = useRef(initialValue);
  
  const [storedValue, setStoredValue] = useState<T>(() => {
    return readFromStorage(key, initialValue);
  });

  useEffect(() => {
    const newValue = readFromStorage(key, initialValueRef.current);
    setStoredValue(newValue);
  }, [key]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      setStoredValue((prevValue) => {
        const valueToStore = value instanceof Function ? value(prevValue) : value;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          emitStorageChange(key);
        }
        return valueToStore;
      });
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue];
}

export function useStorageListener(callback: () => void, filterKey?: string) {
  useEffect(() => {
    const handleStorageChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ key: string }>;
      if (filterKey && customEvent.detail?.key !== filterKey) {
        return;
      }
      callback();
    };

    window.addEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
    return () => {
      window.removeEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
    };
  }, [callback, filterKey]);
}
