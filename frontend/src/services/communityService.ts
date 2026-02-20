const API_URL = "https://us-central1-orazaapp.cloudfunctions.net/api";

const CACHE_KEY_PREFIX = "community_cache_";

export function getCachedCommunityProgress(date: string) {
  try {
    const cached = localStorage.getItem(CACHE_KEY_PREFIX + date);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    console.warn("Community cache read error:", e);
  }
  return null;
}

export async function getCommunityProgress(date: string) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/tasks/community/${date}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch community progress");
  }

  const data = await response.json();

  // Cache the response so photos load instantly next visit
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + date, JSON.stringify(data));
  } catch (e) {
    console.warn("Community cache write error:", e);
  }

  return data;
}
