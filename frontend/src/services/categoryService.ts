import { api } from './api';

export interface Category {
  id: string;
  name: string;
  target: number;
  meaning?: string;
  order: number;
}

export const getCategories = async (): Promise<Category[]> => {
  return api('/categories', { method: 'GET' });
};

export const createCategory = async (
  name: string,
  target: number,
  meaning: string = '',
  order: number = 0
): Promise<Category> => {
  return api('/categories', {
    method: 'POST',
    body: JSON.stringify({ name, target, meaning, order }),
  });
};

export const updateCategory = async (
  id: string,
  name?: string,
  target?: number,
  meaning?: string,
  order?: number
): Promise<Category> => {
  return api(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, target, meaning, order }),
  });
};

export const deleteCategory = async (id: string): Promise<{ success: boolean }> => {
  return api(`/categories/${id}`, { method: 'DELETE' });
};
