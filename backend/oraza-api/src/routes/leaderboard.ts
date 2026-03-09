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

function buildTopList(
  scores: { userId: string; displayName: string; photoURL?: string; score: number }[],
  currentUserId: string
): { topList: LeaderboardEntry[]; userRank: LeaderboardEntry | null } {
  scores.sort((a, b) => b.score - a.score);

  const topList: LeaderboardEntry[] = scores.slice(0, 10).map((entry, idx) => ({
    rank: idx + 1,
    userId: entry.userId,
    displayName: entry.displayName,
    photoURL: entry.photoURL,
    score: entry.score,
    medal: idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : undefined,
  }));

  const userRankIndex = scores.findIndex((s) => s.userId === currentUserId);
  let userRank: LeaderboardEntry | null = null;
  if (userRankIndex !== -1 && userRankIndex >= 10) {
    const s = scores[userRankIndex];
    userRank = {
      rank: userRankIndex + 1,
      userId: s.userId,
      displayName: s.displayName,
      photoURL: s.photoURL,
      score: s.score,
    };
  }

  return { topList, userRank };
}

// GET /leaderboard/all — returns all 3 leaderboards in one request
router.get("/all", authMiddleware, async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (res.locals as any).userId;

    // Read all data once
    const [usersSnap, categoriesSnap, allProgressSnap, allQuizSnap] = await Promise.all([
      db.ref("users").get(),
      db.ref("categories").get(),
      db.ref("progress").get(),
      db.ref("quiz-results").get(),
    ]);

    const users = usersSnap.val() || {};
    const categories = categoriesSnap.val() || {};
    const allProgress = allProgressSnap.val() || {};
    const allQuizResults = allQuizSnap.val() || {};

    const categoryIds = Object.keys(categories);

    // Find FirstThreeNames category
    const firstThreeNamesEntry = Object.entries(categories).find(
      ([_, c]: [string, any]) => c.target === 3 && c.name?.includes("есімі")
    );
    const asmasCategoryId = firstThreeNamesEntry ? firstThreeNamesEntry[0] : null;

    const asmaScores: { userId: string; displayName: string; photoURL?: string; score: number }[] = [];
    const marathonScores: { userId: string; displayName: string; photoURL?: string; score: number }[] = [];
    const quizScores: { userId: string; displayName: string; photoURL?: string; score: number }[] = [];

    for (const [uid, userData] of Object.entries(users)) {
      if ((userData as any).role === "admin") continue;

      const displayName = (userData as any).displayName || "User";
      const photoURL = (userData as any).photoURL;
      const userProgress = allProgress[uid] || {};
      const userQuiz = allQuizResults[uid] || {};

      // Asma: count total learned names
      let totalAsmaLearned = 0;
      if (asmasCategoryId) {
        for (const dayProgress of Object.values(userProgress)) {
          const count = (dayProgress as any)[asmasCategoryId];
          if (Array.isArray(count)) {
            totalAsmaLearned += count.filter((c: number) => c >= 33).length;
          }
        }
      }
      asmaScores.push({ userId: uid, displayName, photoURL, score: totalAsmaLearned });

      // Marathon: count fully completed days
      let completedDays = 0;
      for (const dayProgress of Object.values(userProgress)) {
        if (Object.keys(dayProgress as any).length === 0) continue;
        const allDone = categoryIds.every((catId) => {
          const count = (dayProgress as any)[catId];
          const cat = categories[catId] as any;
          return count !== undefined && Number(count) >= cat.target;
        });
        if (allDone) completedDays++;
      }
      marathonScores.push({ userId: uid, displayName, photoURL, score: completedDays });

      // Quiz: best percentage
      let bestScore = 0;
      for (const result of Object.values(userQuiz)) {
        const r = result as any;
        if (r && typeof r.percentage === "number" && r.percentage > bestScore) {
          bestScore = r.percentage;
        }
      }
      quizScores.push({ userId: uid, displayName, photoURL, score: bestScore });
    }

    res.json({
      asma: buildTopList(asmaScores, userId),
      marathon: buildTopList(marathonScores, userId),
      quiz: buildTopList(quizScores, userId),
    });
  } catch (error) {
    console.error("Error fetching leaderboards:", error instanceof Error ? error.message : error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to fetch leaderboards" });
  }
});

export default router;
