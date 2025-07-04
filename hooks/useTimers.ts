import { useState, useEffect, useRef, useCallback } from 'react';
import { Timer, TimerHistory, Category } from '@/types/timer';
import { useAsyncStorage } from '@/hooks/useAsyncStorage';
import { generateId } from '@/utils/timerUtils';

export function useTimers() {
  const [timers, setTimers, timersLoading] = useAsyncStorage<Timer[]>('timers', []);
  const [history, setHistory, historyLoading] = useAsyncStorage<TimerHistory[]>('timer_history', []);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryExpansionState, setCategoryExpansionState] = useState<Record<string, boolean>>({});

  // Global timer effect - runs every second for all active timers
  useEffect(() => {
    if (timersLoading) return; // Don't start timer until data is loaded

    const globalInterval = setInterval(() => {
      setTimers(prevTimers => {
        let hasChanges = false;
        const updatedTimers = prevTimers.map(timer => {
          if (timer.status === 'running' && timer.remainingTime > 0) {
            hasChanges = true;
            const newRemainingTime = Math.max(0, timer.remainingTime - 1);
            
            // Check for halfway alert
            if (timer.halfwayAlert && !timer.halfwayAlertTriggered && 
                newRemainingTime <= timer.duration / 2 && newRemainingTime > 0) {
              console.log(`🔔 Halfway alert for timer: ${timer.name}`);
              return { ...timer, remainingTime: newRemainingTime, halfwayAlertTriggered: true };
            }
            
            // Check if timer completed
            if (newRemainingTime === 0) {
              console.log(`✅ Timer completed: ${timer.name}`);
              
              // Add to history immediately
              const historyEntry: TimerHistory = {
                id: generateId(),
                name: timer.name,
                category: timer.category,
                duration: timer.duration,
                completedAt: new Date(),
              };
              
              // Update history in the next tick to avoid state conflicts
              setTimeout(() => {
                setHistory(prev => [historyEntry, ...prev]);
              }, 0);
              
              return { ...timer, remainingTime: 0, status: 'completed' as const };
            }
            
            return { ...timer, remainingTime: newRemainingTime };
          }
          return timer;
        });
        
        return hasChanges ? updatedTimers : prevTimers;
      });
    }, 1000);

    return () => clearInterval(globalInterval);
  }, [setTimers, setHistory, timersLoading]);

  useEffect(() => {
    if (!timersLoading) {
      updateCategories();
    }
  }, [timers, categoryExpansionState, timersLoading]);

  const updateCategories = useCallback(() => {
    const categoryMap = new Map<string, Category>();
    
    timers.forEach(timer => {
      if (!categoryMap.has(timer.category)) {
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

  // Simple add timer function - immediate state update
  const addTimer = useCallback((name: string, duration: number, category: string, halfwayAlert = false) => {
    if (name.trim()) {
      const newTimer: Timer = {
        id: generateId(),
        name: name.trim(),
        duration,
        category,
        remainingTime: duration,
        status: 'idle',
        createdAt: new Date(),
        halfwayAlert,
        halfwayAlertTriggered: false,
      };
      
      console.log('Adding new timer:', newTimer);
      
      // Ensure the category is expanded when adding a new timer
      setCategoryExpansionState(prev => ({
        ...prev,
        [category]: true
      }));
      
      // Immediate state update for instant UI response
      setTimers(prevTimers => [...prevTimers, newTimer]);
    }
  }, [setTimers]);

  // Immediate delete timer function
  const deleteTimer = useCallback((id: string) => {
    console.log('Deleting timer with id:', id);
    // Immediate state update for instant UI response
    setTimers(prevTimers => {
      const filtered = prevTimers.filter(timer => timer.id !== id);
      console.log('Timers after delete:', filtered.length);
      return filtered;
    });
  }, [setTimers]);

  const updateTimer = useCallback((id: string, updates: Partial<Timer>) => {
    setTimers(prev => prev.map(timer => 
      timer.id === id ? { ...timer, ...updates } : timer
    ));
  }, [setTimers]);

  const startTimer = useCallback((id: string) => {
    setTimers(prev => prev.map(timer => {
      if (timer.id === id && timer.status !== 'running' && timer.remainingTime > 0) {
        console.log(`Starting timer: ${timer.name}`);
        return { ...timer, status: 'running' as const };
      }
      return timer;
    }));
  }, [setTimers]);

  const pauseTimer = useCallback((id: string) => {
    updateTimer(id, { status: 'paused' });
  }, [updateTimer]);

  const resetTimer = useCallback((id: string) => {
    setTimers(prev => prev.map(timer => {
      if (timer.id === id) {
        console.log(`Resetting timer: ${timer.name}`);
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

  const startAllInCategory = useCallback((category: string) => {
    setTimers(prev => prev.map(timer => {
      if (timer.category === category && timer.status !== 'completed' && 
          timer.remainingTime > 0 && timer.status !== 'running') {
        return { ...timer, status: 'running' as const };
      }
      return timer;
    }));
  }, [setTimers]);

  const pauseAllInCategory = useCallback((category: string) => {
    setTimers(prev => prev.map(timer => {
      if (timer.category === category && timer.status === 'running') {
        return { ...timer, status: 'paused' as const };
      }
      return timer;
    }));
  }, [setTimers]);

  const resetAllInCategory = useCallback((category: string) => {
    setTimers(prev => prev.map(timer => {
      if (timer.category === category) {
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
    isLoading: timersLoading || historyLoading,
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