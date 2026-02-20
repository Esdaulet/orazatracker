const BASE_URL = "https://us-central1-orazaapp.cloudfunctions.net/api";

export const api = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Ошибка сервера");
  }

  return data;
};
