import { api } from './api';

// Helper to save token to both storages (Safari fallback)
const saveToken = (token: string) => {
  localStorage.setItem('token', token);
  sessionStorage.setItem('token', token);
};

// Helper to get token from either storage (exported for use in api.ts)
export const getToken = (): string | null => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

export const registerUser = async (
  phone: string,
  password: string,
  displayName: string,
  referralCode?: string,
) => {
  const data = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ phone, password, displayName, referralCode }),
  });

  saveToken(data.token);
  return data.user;
};

export const loginUser = async (phone: string, password: string) => {
  const data = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  });

  saveToken(data.token);
  return data.user;
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  localStorage.removeItem('photoURL');
};

export const getMyProfile = async () => {
  const data = await api('/auth/me');
  return data;
};

export const getStoredUser = () => {
  const token = getToken();
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
      logoutUser(); // Clear both storages if token expired
      return null;
    }
    return payload;
  } catch {
    return null;
  }
};
