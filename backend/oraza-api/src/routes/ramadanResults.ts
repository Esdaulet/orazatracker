import { Router, Response } from "express";
import { db } from "../utils/firebase";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

const RAMADAN_START = "2026-02-19";
const RAMADAN_END = "2026-03-19";

// GET /ramadan-results — personal Ramadan summary for current user
router.get("/", authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = (res.locals as any).userId;

    const [userProgressSnap, categoriesSnap, quizSnap] = await Promise.all([
      db.ref(`progress/${userId}`).get(),
      db.ref("categories").get(),
      db.ref(`quiz-results/${userId}`).get(),
    ]);

    const userProgress = userProgressSnap.val() || {};
    const categories = categoriesSnap.val() || {};
    const quizResults = quizSnap.val() || {};

    // Filter only Ramadan dates
    const ramadanDates = Object.keys(userProgress).filter(
      (d) => d >= RAMADAN_START && d <= RAMADAN_END
    );

    // Active days
    const activeDays = ramadanDates.filter(
      (d) => Object.keys(userProgress[d] || {}).length > 0
    ).length;

    // Total per category
    const categoryTotals: Record<string, number> = {};
    for (const date of ramadanDates) {
      const dayProgress = userProgress[date] || {};
      for (const [catId, count] of Object.entries(dayProgress)) {
        if (!categoryTotals[catId]) categoryTotals[catId] = 0;
        if (Array.isArray(count)) {
          categoryTotals[catId] += (count as number[]).reduce((a, b) => a + b, 0);
        } else {
          categoryTotals[catId] += Number(count) || 0;
        }
      }
    }

    // Asma learned (count arrays with value >= 33)
    let asmaLearned = 0;
    const asmasCategoryId = Object.entries(categories).find(
      ([_, c]: [string, any]) => c.target === 3 && c.name?.includes("есімі")
    )?.[0];

    if (asmasCategoryId) {
      for (const date of ramadanDates) {
        const count = userProgress[date]?.[asmasCategoryId];
        if (Array.isArray(count)) {
          asmaLearned += (count as number[]).filter((c) => c >= 33).length;
        }
      }
    }

    // Quiz stats
    const quizDates = Object.keys(quizResults).filter(
      (d) => d >= RAMADAN_START && d <= RAMADAN_END
    );
    const totalQuizzes = quizDates.length;
    let totalQuizScore = 0;
    let bestScore = 0;
    for (const date of quizDates) {
      const r = quizResults[date];
      if (r && typeof r.score === "number") {
        totalQuizScore += r.score;
        if (r.score > bestScore) bestScore = r.score;
      }
    }

    // Build category summary
    const categorySummary = Object.entries(categoryTotals)
      .map(([catId, total]) => {
        const cat = categories[catId] as any;
        if (!cat) return null;
        return {
          id: catId,
          name: cat.name,
          meaning: cat.meaning || "",
          total,
          target: cat.target,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.total - a.total);

    // Category nominations — who has the most per category across all users
    const [allProgressSnap, usersSnap] = await Promise.all([
      db.ref("progress").get(),
      db.ref("users").get(),
    ]);
    const allProgress = allProgressSnap.val() || {};
    const users = usersSnap.val() || {};

    const categoryNominations: Record<string, { displayName: string; total: number }> = {};

    for (const [uid, userProgressData] of Object.entries(allProgress)) {
      const userData = users[uid] as any;
      if (!userData || userData.role === "admin") continue;
      const displayName = userData.displayName || "User";

      const ramadanDatesAll = Object.keys(userProgressData as any).filter(
        (d) => d >= RAMADAN_START && d <= RAMADAN_END
      );

      for (const date of ramadanDatesAll) {
        const dayProg = (userProgressData as any)[date] || {};
        for (const [catId, count] of Object.entries(dayProg)) {
          let total = 0;
          if (Array.isArray(count)) {
            total = (count as number[]).reduce((a, b) => a + b, 0);
          } else {
            total = Number(count) || 0;
          }
          if (!categoryNominations[catId]) {
            categoryNominations[catId] = { displayName, total };
          } else if (total > categoryNominations[catId].total) {
            categoryNominations[catId] = { displayName, total };
          }
        }
      }
    }

    // Build nominations list with category names
    const nominations = Object.entries(categoryNominations)
      .map(([catId, winner]) => {
        const cat = categories[catId] as any;
        if (!cat) return null;
        return {
          categoryId: catId,
          categoryName: cat.name,
          meaning: cat.meaning || "",
          winner: winner.displayName,
          total: winner.total,
        };
      })
      .filter(Boolean);

    res.json({
      activeDays,
      totalRamadanDays: 30,
      asmaLearned,
      totalAsma: 99,
      quiz: {
        totalQuizzes,
        totalScore: totalQuizScore,
        bestScore,
      },
      categories: categorySummary,
      nominations,
    });
  } catch (error) {
    console.error("Error fetching ramadan results:", error);
    res.status(500).json({ error: "Failed to fetch results" });
  }
});

export default router;
