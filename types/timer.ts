export interface Timer {
  id: string;
  name: string;
  duration: number; // in seconds
  category: string;
  remainingTime: number;
  status: 'idle' | 'running' | 'paused' | 'completed';
  createdAt: Date;
  halfwayAlert?: boolean;
  halfwayAlertTriggered?: boolean;
}

export interface TimerHistory {
  id: string;
  name: string;
  category: string;
  duration: number;
  completedAt: Date;
}

export interface Category {
  name: string;
  timers: Timer[];
  isExpanded: boolean;
}

export type Theme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  accent: string;
}