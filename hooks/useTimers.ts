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
    // Clear any existing interval for this timer first
    const existingInterval = intervalRefs.current.get(id);
    if (existingInterval) {
      clearInterval(existingInterval);
      intervalRefs.current.delete(id);
    }

    // Get current timer state
    setTimers(prevTimers => {
      const timer = prevTimers.find(t => t.id === id);
      if (!timer || timer.status === 'running' || timer.remainingTime <= 0) {
        return prevTimers;
      }

      // Update timer to running status
      const updatedTimers = prevTimers.map(t => 
        t.id === id ? { ...t, status: 'running' as const } : t
      );

      // Start the interval
      const interval = setInterval(() => {
        setTimers(currentTimers => {
          return currentTimers.map(t => {
            if (t.id === id && t.status === 'running') {
              const newRemainingTime = Math.max(0, t.remainingTime - 1);
              
              // Check for halfway alert
              if (t.halfwayAlert && !t.halfwayAlertTriggered && newRemainingTime <= t.duration / 2 && newRemainingTime > 0) {
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
                const historyEntry: TimerHistory = {
                  id: generateId(),
                  name: t.name,
                  category: t.category,
                  duration: t.duration,
                  completedAt: new Date(),
                };
                setHistory(prev => [historyEntry, ...prev]);
                
                return { ...t, remainingTime: 0, status: 'completed' as const };
              }
              
              return { ...t, remainingTime: newRemainingTime };
            }
            return t;
          });
        });
      }, 1000);
      
      intervalRefs.current.set(id, interval);
      return updatedTimers;
    });
  }, [setTimers, setHistory]);

  const pauseTimer = useCallback((id: string) => {
    const interval = intervalRefs.current.get(id);
    if (interval) {
      clearInterval(interval);
      intervalRefs.current.delete(id);
    }
    updateTimer(id, { status: 'paused' });
  }, [updateTimer]);

  const resetTimer = useCallback((id: string) => {
    const interval = intervalRefs.current.get(id);
    if (interval) {
      clearInterval(interval);
      intervalRefs.current.delete(id);
    }
    
    setTimers(prev => prev.map(timer => {
      if (timer.id === id) {
        return {
          ...timer,
          remainingTime: timer.duration,
          status: 'idle' as const,
          halfwayAlertTriggered: false,
        };
      }
      return timer;
    }));
  }, [setTimers]);

  const deleteTimer = useCallback((id: string) => {
    const interval = intervalRefs.current.get(id);
    if (interval) {
      clearInterval(interval);
      intervalRefs.current.delete(id);
    }
    setTimers(prev => prev.filter(timer => timer.id !== id));
  }, [setTimers]);

  const startAllInCategory = useCallback((category: string) => {
    setTimers(prevTimers => {
      const categoryTimers = prevTimers.filter(t => 
        t.category === category && t.status !== 'completed' && t.remainingTime > 0
      );
      categoryTimers.forEach(timer => {
        if (timer.status !== 'running') {
          startTimer(timer.id);
        }
      });
      return prevTimers;
    });
  }, [startTimer]);

  const pauseAllInCategory = useCallback((category: string) => {
    setTimers(prevTimers => {
      const categoryTimers = prevTimers.filter(t => 
        t.category === category && t.status === 'running'
      );
      categoryTimers.forEach(timer => pauseTimer(timer.id));
      return prevTimers;
    });
  }, [pauseTimer]);

  const resetAllInCategory = useCallback((category: string) => {
    setTimers(prevTimers => {
      const categoryTimers = prevTimers.filter(t => t.category === category);
      categoryTimers.forEach(timer => resetTimer(timer.id));
      return prevTimers;
    });
  }, [resetTimer]);

  const toggleCategoryExpansion = useCallback((categoryName: string) => {
    setCategoryExpansionState(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  }, []);

  const exportData = useCallback(() => {
    const exportData = {
      timers,
      history,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(exportData, null, 2);
  }, [timers, history]);

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