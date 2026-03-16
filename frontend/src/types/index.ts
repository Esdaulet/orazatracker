export interface Task {
  id: string;
  date: string;
  name: string;
  target: number;
  unit: string;
  category: 'zikr' | 'quran' | 'prayer' | 'other';
  createdAt: number;
}

export interface Progress {
  completed: number;
  updatedAt: number;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: 'zikr' | 'quran' | 'prayer' | 'other';
  target: number; // e.g., 100 for 100 zikrs
  unit: string; // e.g., "times", "pages"
  createdAt: number;
}

export interface HabitLog {
  id: string;
  habitId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  completed: number;
  notes?: string;
  timestamp: number;
}

export interface Category {
  id: string;
  name: string;
  target: number;
  meaning?: string;
  translation?: string;
  order: number;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt?: number;
  isAdmin?: boolean;
}