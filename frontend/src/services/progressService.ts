import { api } from './api';

export interface Progress {
  [categoryId: string]: number;
}

export const getProgress = async (date: string): Promise<Progress> => {
  return api(`/tasks/progress/${date}`, { method: 'GET' });
};

export const saveProgress = async (
  date: string,
  categoryId: string,
  count: number
): Promise<{ success: boolean }> => {
  return api('/tasks/progress', {
    method: 'POST',
    body: JSON.stringify({ date, categoryId, count }),
  });
};
