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

export interface SprintLeaderboardData extends LeaderboardData {
  daysRemaining: number;
  weekStart: string;
  weekEnd: string;
}

export interface AllLeaderboards {
  asma: LeaderboardData;
  marathon: LeaderboardData;
  sprint: SprintLeaderboardData;
  quiz: LeaderboardData;
}

// Get all leaderboards in one request
export async function getAllLeaderboards(): Promise<AllLeaderboards> {
  try {
    const response = await api("/leaderboard/all");
    return response;
  } catch (error) {
    console.error("Error fetching leaderboards:", error);
    const empty = { topList: [], userRank: null };
    return { asma: empty, marathon: empty, sprint: { ...empty, daysRemaining: 0, weekStart: "", weekEnd: "" }, quiz: empty };
  }
}
