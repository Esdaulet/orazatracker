import { Router, Response } from "express";
import { db } from "../utils/firebase";
import { authMiddleware, AuthRequest } from "../middleware/auth";

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
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;

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

    // Find FirstThreeNames category
    const firstThreeNamesEntry = Object.entries(categories).find(
      ([_, c]: [string, any]) => c.target === 3 && c.name?.includes("есімі")
    );
    const asmasCategoryId = firstThreeNamesEntry ? firstThreeNamesEntry[0] : null;

    // Current week bounds (Monday–Sunday, Almaty UTC+5)
    const nowUtc = new Date();
    const almatyOffset = 5 * 60 * 60 * 1000;
    const nowAlmaty = new Date(nowUtc.getTime() + almatyOffset);
    const dow = nowAlmaty.getUTCDay(); // 0=Sun
    const diffToMon = dow === 0 ? -6 : 1 - dow;
    const weekStart = new Date(nowAlmaty);
    weekStart.setUTCDate(nowAlmaty.getUTCDate() + diffToMon);
    const weekStartStr = weekStart.toISOString().slice(0, 10);
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
    const weekEndStr = weekEnd.toISOString().slice(0, 10);
    const daysRemaining = 7 - (dow === 0 ? 7 : dow - 1) - 1; // days left after today

    const asmaScores: { userId: string; displayName: string; photoURL?: string; score: number }[] = [];
    const marathonScores: { userId: string; displayName: string; photoURL?: string; score: number }[] = [];
    const sprintScores: { userId: string; displayName: string; photoURL?: string; score: number }[] = [];
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

      // Marathon: count fully completed days.
      // For each day, only require categories that existed on that day
      // (checked via createdAt). This prevents newly added categories from
      // retroactively invalidating previously completed days.
      let completedDays = 0;
      for (const [dateStr, dayProgress] of Object.entries(userProgress)) {
        if (Object.keys(dayProgress as any).length === 0) continue;

        const dayEndTimestamp = new Date(dateStr).getTime() + 86400000;
        const activeCatIds = Object.entries(categories)
          .filter(([_, cat]: [string, any]) => ((cat.createdAt as number) || 0) <= dayEndTimestamp)
          .map(([catId]) => catId);

        if (activeCatIds.length === 0) continue;

        const allDone = activeCatIds.every((catId) => {
          const count = (dayProgress as any)[catId];
          if (Array.isArray(count)) return true; // array-type categories (e.g. asma) are not required
          const cat = categories[catId] as any;
          return count !== undefined && Number(count) >= cat.target;
        });
        if (allDone) completedDays++;
      }
      // Manual overrides for marathon scores
      const MARATHON_OVERRIDES: Record<string, number> = {
        "user_1771481082260_uxu20": 16, // Еса
      };
      const finalMarathonScore = MARATHON_OVERRIDES[uid] ?? completedDays;
      marathonScores.push({ userId: uid, displayName, photoURL, score: finalMarathonScore });

      // Sprint: completed days in current week (Mon–Sun)
      let sprintDays = 0;
      for (const [dateStr, dayProgress] of Object.entries(userProgress)) {
        if (dateStr < weekStartStr || dateStr > weekEndStr) continue;
        if (Object.keys(dayProgress as any).length === 0) continue;
        const dayEndTimestamp = new Date(dateStr).getTime() + 86400000;
        const activeCatIds = Object.entries(categories)
          .filter(([_, cat]: [string, any]) => ((cat.createdAt as number) || 0) <= dayEndTimestamp)
          .map(([catId]) => catId);
        if (activeCatIds.length === 0) continue;
        const allDone = activeCatIds.every((catId) => {
          const count = (dayProgress as any)[catId];
          if (Array.isArray(count)) return true;
          const cat = categories[catId] as any;
          return count !== undefined && Number(count) >= cat.target;
        });
        if (allDone) sprintDays++;
      }
      sprintScores.push({ userId: uid, displayName, photoURL, score: sprintDays });

      // Quiz: sum of correct answers across all attempts
      let totalScore = 0;
      for (const result of Object.values(userQuiz)) {
        const r = result as any;
        if (r && typeof r.score === "number") {
          totalScore += r.score;
        }
      }
      quizScores.push({ userId: uid, displayName, photoURL, score: totalScore });
    }

    res.json({
      asma: buildTopList(asmaScores, userId),
      marathon: buildTopList(marathonScores, userId),
      sprint: { ...buildTopList(sprintScores, userId), daysRemaining, weekStart: weekStartStr, weekEnd: weekEndStr },
      quiz: buildTopList(quizScores, userId),
    });
  } catch (error) {
    console.error("Error fetching leaderboards:", error instanceof Error ? error.message : error);
    res.status(500).json({ error: error instanceof Error ? error.message : "Failed to fetch leaderboards" });
  }
});

export default router;