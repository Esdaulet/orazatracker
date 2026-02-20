const API_URL = "https://us-central1-orazaapp.cloudfunctions.net/api";

export interface UserSurah {
  name: string;
  learned: boolean;
  setAt?: number;
}

export interface SurahMember {
  userId: string;
  displayName: string;
  photoURL?: string | null;
  surah: UserSurah | null;
}

export interface WeekSurahData {
  weekNumber: number;
  members: SurahMember[];
  mySurah: UserSurah | null;
}

export interface QuranSurah {
  number: number;
  englishName: string;
  name: string; // Arabic name
  numberOfAyahs: number;
  revelationType: "Meccan" | "Medinan";
}

function authHeaders() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

export async function getWeekSurahs(): Promise<WeekSurahData> {
  const response = await fetch(`${API_URL}/surah/week`, {
    headers: authHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch week surahs");
  return response.json();
}

export async function setMySurah(name: string): Promise<UserSurah> {
  const response = await fetch(`${API_URL}/surah/set`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error("Failed to set surah");
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

let cachedSurahList: QuranSurah[] | null = null;

export async function fetchAllSurahs(): Promise<QuranSurah[]> {
  if (cachedSurahList) return cachedSurahList;
  const response = await fetch("https://api.alquran.cloud/v1/surah");
  if (!response.ok) throw new Error("Failed to fetch surah list");
  const json = await response.json();
  cachedSurahList = json.data as QuranSurah[];
  return cachedSurahList;
}
