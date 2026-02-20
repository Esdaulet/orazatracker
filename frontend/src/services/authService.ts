import { api } from './api';

export const registerUser = async (phone: string, password: string, displayName: string) => {
  const data = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ phone, password, displayName }),
  });

  localStorage.setItem('token', data.token);
  return data.user;
};

export const loginUser = async (phone: string, password: string) => {
  const data = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  });

  localStorage.setItem('token', data.token);
  return data.user;
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('photoURL');
};

export const getMyProfile = async () => {
  const data = await api('/auth/me');
  return data;
};

export const getStoredUser = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(json);
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};
