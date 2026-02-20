import { Router, Response } from "express";
import { db } from "../utils/firebase";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// Ramadan 2026: Feb 19 – Mar 20
const RAMADAN_START = new Date(2026, 1, 19);

function getCurrentWeekNumber(): number {
  const now = new Date();
  const diff = Math.floor(
    (now.getTime() - RAMADAN_START.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff < 0) return 1;
  return Math.min(Math.ceil((diff + 1) / 7), 4);
}

// GET /surah/week — get all members' surahs for current week
router.get("/week", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const weekNumber = getCurrentWeekNumber();
    const weekKey = `week_${weekNumber}`;

    const [surahsSnap, usersSnap] = await Promise.all([
      db.ref(`surah_weekly/${weekKey}`).get(),
      db.ref("users").get(),
    ]);

    const users = usersSnap.exists() ? usersSnap.val() : {};
    const surahs = surahsSnap.exists() ? surahsSnap.val() : {};

    const members = Object.entries(users)
      .filter(([_, userData]: any) => userData.role !== "admin")
      .map(([userId, userData]: any) => {
        const userSurah = surahs[userId] || null;
        return {
          userId,
          displayName: userData.displayName,
          photoURL: userData.photoURL || null,
          surah: userSurah
            ? {
                name: userSurah.name,
                learned: userSurah.learned || false,
                setAt: userSurah.setAt,
              }
            : null,
        };
      });

    // Sort: learned first, then by name
    members.sort((a, b) => {
      if (a.surah?.learned && !b.surah?.learned) return -1;
      if (!a.surah?.learned && b.surah?.learned) return 1;
      return a.displayName.localeCompare(b.displayName);
    });

    const mySurah = surahs[req.userId!] || null;

    return res.json({
      weekNumber,
      members,
      mySurah: mySurah
        ? { name: mySurah.name, learned: mySurah.learned || false }
        : null,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /surah/set — user sets their surah for current week
router.post("/set", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "name is required" });
  }

  try {
    const weekNumber = getCurrentWeekNumber();
    const weekKey = `week_${weekNumber}`;

    const entry = {
      name,
      learned: false,
      setAt: Date.now(),
    };

    await db.ref(`surah_weekly/${weekKey}/${req.userId}`).set(entry);
    return res.status(201).json(entry);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /surah/learned — toggle learned status for my current surah
router.post(
  "/learned",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const weekNumber = getCurrentWeekNumber();
      const weekKey = `week_${weekNumber}`;

      const snapshot = await db
        .ref(`surah_weekly/${weekKey}/${req.userId}`)
        .get();

      if (!snapshot.exists()) {
        return res.status(400).json({ error: "Set your surah first" });
      }

      const current = snapshot.val();
      const newLearned = !current.learned;

      await db
        .ref(`surah_weekly/${weekKey}/${req.userId}/learned`)
        .set(newLearned);

      return res.json({ learned: newLearned });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;