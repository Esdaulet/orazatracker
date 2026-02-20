const API_URL = "https://us-central1-orazaapp.cloudfunctions.net/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

export async function trackPageView(page: string): Promise<void> {
  try {
    await fetch(`${API_URL}/analytics/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ page }),
    });
  } catch (error) {
    console.error("Failed to track page view:", error);
  }
}

export async function getAnalytics(date: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_URL}/analytics/views/${date}`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch analytics");
    return response.json();
  } catch (error) {
    console.error("Failed to get analytics:", error);
    return [];
  }
}
