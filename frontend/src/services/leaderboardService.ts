import { api } from "./api";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  photoURL?: string;
  score: number;
  medal?: "🥇" | "🥈" | "🥉";
}

export interface LeaderboardData {
  topList: LeaderboardEntry[];
  userRank: LeaderboardEntry | null;
}

// Get leaderboard for learned names (Asma)
export async function getAsmaLeaderboard(): Promise<LeaderboardData> {
  try {
    const response = await api("leaderboard/asma");
    return response;
  } catch (error) {
    console.error("Error fetching asma leaderboard:", error);
    return { topList: [], userRank: null };
  }
}

// Get leaderboard for daily consistency (Marathon)
export async function getMarathonLeaderboard(): Promise<LeaderboardData> {
  try {
    const response = await api("leaderboard/marathon");
    return response;
  } catch (error) {
    console.error("Error fetching marathon leaderboard:", error);
    return { topList: [], userRank: null };
  }
}
