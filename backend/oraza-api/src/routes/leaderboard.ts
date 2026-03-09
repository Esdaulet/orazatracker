import { Router, Request, Response } from "express";
import { db } from "../utils/firebase";
import { authMiddleware } from "../middleware/auth";

const router = Router();

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  photoURL?: string;
  score: number;
  medal?: "🥇" | "🥈" | "🥉";
}

// Get Asma names leaderboard (most learned names)
router.get("/asma", authMiddleware, async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (res.locals as any).userId;

    // Get all users
    const usersSnap = await db.ref("users").once("value");
    const users = usersSnap.val() || {};

    // Get all categories to find FirstThreeNames
    const categoriesSnap = await db.ref("categories").once("value");
    const categories = categoriesSnap.val() || {};
    const firstThreeNamesCategory = Object.values(categories).find(
      (c: any) => c.target === 3 && c.name?.includes("есімі")
    ) as any;

    if (!firstThreeNamesCategory) {
      res.json({ topList: [], userRank: null });
      return;
    }

    const scores: { userId: string; displayName: string; photoURL?: string; score: number }[] =
      [];

    // Calculate scores for all users
    for (const [uid, userData] of Object.entries(users)) {
      if ((userData as any).role === "admin") continue;

      // Get total learned asma (sum of all progress for FirstThreeNames across all days)
      const progressSnap = await db.ref(`progress/${uid}`).once("value");
      const progress = progressSnap.val() || {};

      let totalAsmaLearned = 0;
      for (const dayProgress of Object.values(progress)) {
        const count = (dayProgress as any)[firstThreeNamesCategory.id];
        if (Array.isArray(count)) {
          totalAsmaLearned += count.filter((c: number) => c >= 33).length;
        }
      }

      scores.push({
        userId: uid,
        displayName: (userData as any).displayName || "User",
        photoURL: (userData as any).photoURL,
        score: totalAsmaLearned,
      });
    }

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    // Get top 10 with medals
    const topList: LeaderboardEntry[] = scores.slice(0, 10).map((entry, idx) => ({
      rank: idx + 1,
      userId: entry.userId,
      displayName: entry.displayName,
      photoURL: entry.photoURL,
      score: entry.score,
      medal: idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : undefined,
    }));

    // Find user's rank
    const userRankIndex = scores.findIndex((s) => s.userId === userId);
    let userRank: LeaderboardEntry | null = null;
    if (userRankIndex !== -1 && userRankIndex >= 10) {
      const userScore = scores[userRankIndex];
      userRank = {
        rank: userRankIndex + 1,
        userId: userScore.userId,
        displayName: userScore.displayName,
        photoURL: userScore.photoURL,
        score: userScore.score,
      };
    }

    res.json({ topList, userRank });
  } catch (error) {
    console.error("Error fetching asma leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// Get Marathon leaderboard (daily consistency)
router.get("/marathon", authMiddleware, async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (res.locals as any).userId;

    // Get all users
    const usersSnap = await db.ref("users").once("value");
    const users = usersSnap.val() || {};

    // Get all categories
    const categoriesSnap = await db.ref("categories").once("value");
    const categories = categoriesSnap.val() || {};
    const categoryIds = Object.keys(categories);

    const scores: { userId: string; displayName: string; photoURL?: string; score: number }[] =
      [];

    // Calculate consistency score for each user
    for (const [uid, userData] of Object.entries(users)) {
      if ((userData as any).role === "admin") continue;

      // Count days where user completed all tasks
      const progressSnap = await db.ref(`progress/${uid}`).once("value");
      const progress = progressSnap.val() || {};

      let completedDays = 0;
      let totalDays = 0;

      for (const dayProgress of Object.values(progress)) {
        if (Object.keys(dayProgress as any).length === 0) continue;

        totalDays++;
        const allDone = categoryIds.every((catId) => {
          const count = (dayProgress as any)[catId];
          const cat = categories[catId] as any;
          return count !== undefined && Number(count) >= cat.target;
        });

        if (allDone) completedDays++;
      }

      // Score = days completed
      scores.push({
        userId: uid,
        displayName: (userData as any).displayName || "User",
        photoURL: (userData as any).photoURL,
        score: completedDays,
      });
    }

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    // Get top 10 with medals
    const topList: LeaderboardEntry[] = scores.slice(0, 10).map((entry, idx) => ({
      rank: idx + 1,
      userId: entry.userId,
      displayName: entry.displayName,
      photoURL: entry.photoURL,
      score: entry.score,
      medal: idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : undefined,
    }));

    // Find user's rank
    const userRankIndex = scores.findIndex((s) => s.userId === userId);
    let userRank: LeaderboardEntry | null = null;
    if (userRankIndex !== -1 && userRankIndex >= 10) {
      const userScore = scores[userRankIndex];
      userRank = {
        rank: userRankIndex + 1,
        userId: userScore.userId,
        displayName: userScore.displayName,
        photoURL: userScore.photoURL,
        score: userScore.score,
      };
    }

    res.json({ topList, userRank });
  } catch (error) {
    console.error("Error fetching marathon leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

export default router;
