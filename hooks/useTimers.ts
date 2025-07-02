import { useState, useEffect, useRef, useCallback } from 'react';
import { Timer, TimerHistory, Category } from '@/types/timer';
import { useAsyncStorage } from './useAsyncStorage';
import { generateId } from '@/utils/timerUtils';

export function useTimers() {
  const [timers, setTimers] = useAsyncStorage<Timer[]>('timers', []);
  const [history, setHistory] = useAsyncStorage<TimerHistory[]>('timer_history', []);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryExpansionState, setCategoryExpansionState] = useState<Record<string, boolean>>({});
  const intervalRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const timersRef = useRef<Timer[]>([]);

  // Keep timersRef in sync with timers state
  useEffect(() => {
    timersRef.current = timers;
  }, [timers]);

  useEffect(() => {
    updateCategories();
    
    // Cleanup intervals on unmount
    return () => {
      intervalRefs.current.forEach(interval => clearInterval(interval));
      intervalRefs.current.clear();
    };
  }, [timers, categoryExpansionState]);

  const updateCategories = useCallback(() => {
    const categoryMap = new Map<string, Category>();
    
    timers.forEach(timer => {
      if (!categoryMap.has(timer.category)) {
        // New categories are expanded by default, existing ones keep their state
        const isExpanded = categoryExpansionState[timer.category] !== undefined 
          ? categoryExpansionState[timer.category] 
          : true;
          
        categoryMap.set(timer.category, {
          name: timer.category,
          timers: [],
          isExpanded,
        });
      }
      categoryMap.get(timer.category)!.timers.push(timer);
    });
    
    const newCategories = Array.from(categoryMap.values());
    setCategories(newCategories);
  }, [timers, categoryExpansionState]);

  const addTimer = useCallback((name: string, duration: number, category: string, halfwayAlert = false) => {
    const newTimer: Timer = {
      id: generateId(),
      name,
      duration,
      category,
      remainingTime: duration,
      status: 'idle',
      createdAt: new Date(),
      halfwayAlert,
      halfwayAlertTriggered: false,
    };
    
    // Ensure the category is expanded when adding a new timer
    setCategoryExpansionState(prev => ({
      ...prev,
      [category]: true
    }));
    
    setTimers(prev => [...prev, newTimer]);
  }, [setTimers]);

  const updateTimer = useCallback((id: string, updates: Partial<Timer>) => {
    setTimers(prev => prev.map(timer => 
      timer.id === id ? { ...timer, ...updates } : timer
    ));
  }, [setTimers]);

  const addToHistory = useCallback((timer: Timer) => {
    const historyEntry: TimerHistory = {
      id: generateId(),
      name: timer.name,
      category: timer.category,
      duration: timer.duration,
      completedAt: new Date(),
    };
    setHistory(prev => [historyEntry, ...prev]);
  }, [setHistory]);

  const startTimer = useCallback((id: string) => {
    const timer = timersRef.current.find(t => t.id === id);
    if (!timer || timer.status === 'running' || timer.remainingTime <= 0) return;

    // Clear any existing interval for this timer
    const existingInterval = intervalRefs.current.get(id);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    updateTimer(id, { status: 'running' });
    
    const interval = setInterval(() => {
      setTimers(prevTimers => {
        return prevTimers.map(t => {
          if (t.id === id && t.status === 'running') {
            const newRemainingTime = Math.max(0, t.remainingTime - 1);
            
            // Check for halfway alert
            if (t.halfwayAlert && !t.halfwayAlertTriggered && newRemainingTime <= t.duration / 2 && newRemainingTime > 0) {
              // Trigger halfway alert - in a real app, this would show a notification
              console.log(`Halfway alert for timer: ${t.name}`);
              return { ...t, remainingTime: newRemainingTime, halfwayAlertTriggered: true };
            }
            
            // Check if timer completed
            if (newRemainingTime === 0) {
              // Clear the interval
              const currentInterval = intervalRefs.current.get(id);
              if (currentInterval) {
                clearInterval(currentInterval);
                intervalRefs.current.delete(id);
              }
              
              // Add to history
              setTimeout(() => {
                addToHistory(t);
              }, 0);
              
              return { ...t, remainingTime: 0, status: 'completed' as const };
            }
            
            return { ...t, remainingTime: newRemainingTime };
          }
          return t;
        });
      });
    }, 1000);
    
    intervalRefs.current.set(id, interval);
  }, [updateTimer, addToHistory, setTimers]);

  const pauseTimer = useCallback((id: string) => {
    const interval = intervalRefs.current.get(id);
    if (interval) {
      clearInterval(interval);
      intervalRefs.current.delete(id);
    }
    updateTimer(id, { status: 'paused' });
  }, [updateTimer]);

  const resetTimer = useCallback((id: string) => {
    const timer = timersRef.current.find(t => t.id === id);
    if (!timer) return;

    const interval = intervalRefs.current.get(id);
    if (interval) {
      clearInterval(interval);
      intervalRefs.current.delete(id);
    }
    
    updateTimer(id, { 
      remainingTime: timer.duration, 
      status: 'idle',
      halfwayAlertTriggered: false,
    });
  }, [updateTimer]);

  const deleteTimer = useCallback((id: string) => {
    const interval = intervalRefs.current.get(id);
    if (interval) {
      clearInterval(interval);
      intervalRefs.current.delete(id);
    }
    setTimers(prev => prev.filter(timer => timer.id !== id));
  }, [setTimers]);

  const startAllInCategory = useCallback((category: string) => {
    const categoryTimers = timersRef.current.filter(t => 
      t.category === category && t.status !== 'completed' && t.remainingTime > 0
    );
    categoryTimers.forEach(timer => startTimer(timer.id));
  }, [startTimer]);

  const pauseAllInCategory = useCallback((category: string) => {
    const categoryTimers = timersRef.current.filter(t => 
      t.category === category && t.status === 'running'
    );
    categoryTimers.forEach(timer => pauseTimer(timer.id));
  }, [pauseTimer]);

  const resetAllInCategory = useCallback((category: string) => {
    const categoryTimers = timersRef.current.filter(t => t.category === category);
    categoryTimers.forEach(timer => resetTimer(timer.id));
  }, [resetTimer]);

  const toggleCategoryExpansion = useCallback((categoryName: string) => {
    setCategoryExpansionState(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  }, []);

  const exportData = useCallback(() => {
    const exportData = {
      timers: timersRef.current,
      history,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(exportData, null, 2);
  }, [history]);

  return {
    timers,
    history,
    categories,
    addTimer,
    updateTimer,
    startTimer,
    pauseTimer,
    resetTimer,
    deleteTimer,
    startAllInCategory,
    pauseAllInCategory,
    resetAllInCategory,
    toggleCategoryExpansion,
    exportData,
  };
}