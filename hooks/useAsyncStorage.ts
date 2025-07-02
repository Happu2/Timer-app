import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

export function useAsyncStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredValue();
  }, []);

  const loadStoredValue = async () => {
    try {
      const item = await AsyncStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`Error loading ${key} from storage:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const setValue = async (value: T | ((prev: T) => T)) => {
    try {
      // Handle function updates
      const newValue = typeof value === 'function' ? (value as (prev: T) => T)(storedValue) : value;
      
      // Ensure we never store undefined values
      if (newValue === undefined || newValue === null) {
        console.warn(`Attempted to store undefined/null value for key: ${key}. Using initial value instead.`);
        setStoredValue(initialValue);
        await AsyncStorage.setItem(key, JSON.stringify(initialValue));
        return;
      }
      
      setStoredValue(newValue);
      await AsyncStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error);
      // Fallback to initial value on error
      setStoredValue(initialValue);
    }
  };

  return [storedValue, setValue, isLoading] as const;
}