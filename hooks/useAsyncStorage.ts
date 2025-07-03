import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';

export function useAsyncStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredValue();
  }, [key]);

  const loadStoredValue = async () => {
    try {
      const item = await AsyncStorage.getItem(key);
      if (item !== null) {
        const parsedValue = JSON.parse(item);
        setStoredValue(parsedValue);
      }
    } catch (error) {
      console.error(`Error loading ${key} from storage:`, error);
      setStoredValue(initialValue);
    } finally {
      setIsLoading(false);
    }
  };

  const setValue = async (value: T | ((prev: T) => T)) => {
    try {
      // Handle function updates
      const newValue = typeof value === 'function' ? (value as (prev: T) => T)(storedValue) : value;
      
      // Validate the new value
      if (newValue === undefined || newValue === null) {
        console.warn(`Attempted to store undefined/null value for key: ${key}. Skipping update.`);
        return;
      }
      
      setStoredValue(newValue);
      await AsyncStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error);
    }
  };

  return [storedValue, setValue, isLoading] as const;
}