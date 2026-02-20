import { api } from './api';
import type { Task, Progress } from '../types';

export const getTasks = async (date: string): Promise<Task[]> => {
  return await api(`/tasks/${date}`);
};

export const createTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
  return await api('/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  });
};

export const deleteTask = async (date: string, taskId: string) => {
  return await api(`/tasks/${date}/${taskId}`, { method: 'DELETE' });
};

export const getMyProgress = async (date: string): Promise<Record<string, Progress>> => {
  return await api(`/tasks/${date}/progress/me`);
};

export const saveProgress = async (date: string, taskId: string, completed: number) => {
  return await api('/tasks/progress', {
    method: 'POST',
    body: JSON.stringify({ date, taskId, completed }),
  });
};
