import { Router, Response } from "express";
import { db } from "../utils/firebase";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

const RAMADAN_START = "2026-02-19";
const RAMADAN_END = "2026-03-19";

const NOMINATION_NAMES: Record<string, string> = {
  "cat_1771482184291": "Салауат шебері",
  "cat_1771483661516": "Иман сөзі шебері",
  "cat_1771483730709": "Тәубе шебері",
  "cat_1771500550356": "Көркем есімдер білгірі",
  "cat_1773620403472": "Зікір шебері",
  "special_active":    "Тұрақтылық үлгісі",
  "special_referrals": "Жақсылық таратушы",
  "special_quiz":      "Білім шебері",
};

// GET /ramadan-results — personal Ramadan summary for current user
router.get("/", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

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

    // Category nominations + special nominations
    const [allProgressSnap, usersSnap, referralsSnap, allQuizSnap] = await Promise.all([
      db.ref("progress").get(),
      db.ref("users").get(),
      db.ref("referrals").get(),
      db.ref("quiz-results").get(),
    ]);
    const allProgress = allProgressSnap.val() || {};
    const users = usersSnap.val() || {};
    const allReferrals = referralsSnap.val() || {};
    const allQuiz = allQuizSnap.val() || {};

    // Step 1: sum per user per category across all Ramadan dates
    const userCategoryTotals: Record<string, Record<string, number>> = {};

    for (const [uid, userProgressData] of Object.entries(allProgress)) {
      const userData = users[uid] as any;
      if (!userData || userData.role === "admin") continue;

      const ramadanDatesAll = Object.keys(userProgressData as any).filter(
        (d) => d >= RAMADAN_START && d <= RAMADAN_END
      );

      for (const date of ramadanDatesAll) {
        const dayProg = (userProgressData as any)[date] || {};
        for (const [catId, count] of Object.entries(dayProg)) {
          if (!userCategoryTotals[uid]) userCategoryTotals[uid] = {};
          if (!userCategoryTotals[uid][catId]) userCategoryTotals[uid][catId] = 0;
          if (Array.isArray(count)) {
            userCategoryTotals[uid][catId] += (count as number[]).reduce((a, b) => a + b, 0);
          } else {
            userCategoryTotals[uid][catId] += Number(count) || 0;
          }
        }
      }
    }

    // Step 2: find winner per category
    const categoryNominations: Record<string, { displayName: string; total: number }> = {};

    for (const [uid, catTotals] of Object.entries(userCategoryTotals)) {
      const displayName = (users[uid] as any)?.displayName || "User";
      for (const [catId, total] of Object.entries(catTotals)) {
        if (!categoryNominations[catId] || total > categoryNominations[catId].total) {
          categoryNominations[catId] = { displayName, total };
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
          categoryName: NOMINATION_NAMES[catId] || cat.name,
          meaning: cat.meaning || "",
          winner: winner.displayName,
          total: winner.total,
          unit: "рет",
        };
      })
      .filter(Boolean);

    // Special nomination: Ең белсенді — most active days
    let mostActiveName = "";
    let mostActiveDays = 0;
    for (const [uid, userProgressData] of Object.entries(allProgress)) {
      const userData = users[uid] as any;
      if (!userData || userData.role === "admin") continue;
      const days = Object.keys(userProgressData as any).filter(
        (d) => d >= RAMADAN_START && d <= RAMADAN_END &&
          Object.keys((userProgressData as any)[d] || {}).length > 0
      ).length;
      if (days > mostActiveDays) {
        mostActiveDays = days;
        mostActiveName = userData.displayName || "User";
      }
    }
    if (mostActiveName) {
      nominations.push({
        categoryId: "special_active",
        categoryName: NOMINATION_NAMES["special_active"],
        meaning: "Рамазанда ең көп күн белсенді болған",
        winner: mostActiveName,
        total: mostActiveDays,
        unit: "күн",
      } as any);
    }


    // Special nomination: Жаңа мүшелер — most referrals
    let mostReferralsName = "";
    let mostReferralsCount = 0;
    for (const [uid, refData] of Object.entries(allReferrals)) {
      const userData = users[uid] as any;
      if (!userData || userData.role === "admin") continue;
      const count = Object.keys(refData as any).length;
      if (count > mostReferralsCount) {
        mostReferralsCount = count;
        mostReferralsName = userData.displayName || "User";
      }
    }
    if (mostReferralsName) {
      nominations.push({
        categoryId: "special_referrals",
        categoryName: NOMINATION_NAMES["special_referrals"],
        meaning: "Ең көп адам шақырған",
        winner: mostReferralsName,
        total: mostReferralsCount,
        unit: "адам",
      } as any);
    }

    // Special nomination: Квиз чемпионы — best total quiz score
    let bestQuizName = "";
    let bestQuizTotal = 0;
    for (const [uid, quizData] of Object.entries(allQuiz)) {
      const userData = users[uid] as any;
      if (!userData || userData.role === "admin") continue;
      let total = 0;
      for (const [date, r] of Object.entries(quizData as any)) {
        if (date >= RAMADAN_START && date <= RAMADAN_END) {
          total += (r as any)?.score || 0;
        }
      }
      if (total > bestQuizTotal) {
        bestQuizTotal = total;
        bestQuizName = userData.displayName || "User";
      }
    }
    if (bestQuizName) {
      nominations.push({
        categoryId: "special_quiz",
        categoryName: NOMINATION_NAMES["special_quiz"],
        meaning: "Викторинада ең жоғары нәтиже жинаған",
        winner: bestQuizName,
        total: bestQuizTotal,
        unit: "ұпай",
      } as any);
    }

    res.json({
      activeDays,
      totalRamadanDays: 29,
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
