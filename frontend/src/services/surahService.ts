const API_URL = "https://us-central1-orazaapp.cloudfunctions.net/api";

export interface Surah {
  weekNumber: number;
  name: string;
  kazakh: string;
  transliteration: string;
  setAt: number;
}

export interface Learner {
  userId: string;
  displayName: string;
  photoURL?: string | null;
}

export interface SurahData {
  surah: Surah | null;
  learners: Learner[];
  myLearned: boolean;
  weekNumber: number;
}

function authHeaders() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

export async function getCurrentSurah(): Promise<SurahData> {
  const response = await fetch(`${API_URL}/surah/current`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch surah");
  return response.json();
}

export async function toggleSurahLearned(): Promise<{ learned: boolean }> {
  const response = await fetch(`${API_URL}/surah/learned`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed to toggle learned");
  return response.json();
}

export async function setSurah(
  weekNumber: number,
  name: string,
  kazakh: string,
  transliteration: string
): Promise<Surah> {
  const response = await fetch(`${API_URL}/surah`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ weekNumber, name, kazakh, transliteration }),
  });
  if (!response.ok) throw new Error("Failed to set surah");
  return response.json();
}