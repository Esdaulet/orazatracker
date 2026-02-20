import { api } from './api';
import type { Habit, HabitLog } from '../types';

export const getHabits = async (): Promise<Habit[]> => {
  return await api('/habits');
};

export const addHabit = async (habit: Omit<Habit, 'id' | 'userId' | 'createdAt'>) => {
  return await api('/habits', {
    method: 'POST',
    body: JSON.stringify(habit),
  });
};

export const deleteHabit = async (habitId: string) => {
  return await api(`/habits/${habitId}`, {
    method: 'DELETE',
  });
};

export const getDailyLogs = async (date: string): Promise<Record<string, HabitLog>> => {
  return await api(`/habits/logs/${date}`);
};

export const logHabit = async (habitId: string, date: string, completed: number) => {
  return await api('/habits/logs', {
    method: 'POST',
    body: JSON.stringify({ habitId, date, completed }),
  });
};
