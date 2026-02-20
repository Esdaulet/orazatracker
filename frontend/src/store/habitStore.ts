import { create } from 'zustand';
import type { Habit, HabitLog } from '../types';

interface HabitStore {
  habits: Habit[];
  logs: HabitLog[];
  setHabits: (habits: Habit[]) => void;
  addHabit: (habit: Habit) => void;
  deleteHabit: (id: string) => void;
  setLogs: (logs: HabitLog[]) => void;
  addLog: (log: HabitLog) => void;
}

export const useHabitStore = create<HabitStore>((set) => ({
  habits: [],
  logs: [],
  setHabits: (habits) => set({ habits }),
  addHabit: (habit) => set((state) => ({ habits: [...state.habits, habit] })),
  deleteHabit: (id) => set((state) => ({ habits: state.habits.filter((h) => h.id !== id) })),
  setLogs: (logs) => set({ logs }),
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
}));