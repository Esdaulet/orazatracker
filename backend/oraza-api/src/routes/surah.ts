import { Router, Response } from "express";
import { db } from "../utils/firebase";
import {
  authMiddleware,
  adminMiddleware,
  AuthRequest,
} from "../middleware/auth";

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

// GET /surah/current — get current week's surah + who learned it
router.get(
  "/current",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const weekNumber = getCurrentWeekNumber();
      const weekKey = `week_${weekNumber}`;

      const [surahSnap, progressSnap, usersSnap] = await Promise.all([
        db.ref(`surah/${weekKey}`).get(),
        db.ref(`surah_progress/${weekKey}`).get(),
        db.ref("users").get(),
      ]);

      if (!surahSnap.exists()) {
        return res.json({
          surah: null,
          learners: [],
          myLearned: false,
          weekNumber,
        });
      }

      const surah = surahSnap.val();
      const progress = progressSnap.exists() ? progressSnap.val() : {};
      const users = usersSnap.exists() ? usersSnap.val() : {};

      const myLearned = !!progress[req.userId!];

      const learners = Object.entries(progress)
        .filter(([, learned]) => !!learned)
        .map(([userId]) => ({
          userId,
          displayName: users[userId]?.displayName || "User",
          photoURL: users[userId]?.photoURL || null,
        }));

      return res.json({
        surah: { ...surah, weekNumber },
        learners,
        myLearned,
        weekNumber,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error" });
    }
  }
);

// POST /surah/learned — toggle learned status for current user
router.post(
  "/learned",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const weekNumber = getCurrentWeekNumber();
      const weekKey = `week_${weekNumber}`;

      const snapshot = await db
        .ref(`surah_progress/${weekKey}/${req.userId}`)
        .get();
      const isLearned = snapshot.exists() && snapshot.val() === true;

      if (isLearned) {
        await db.ref(`surah_progress/${weekKey}/${req.userId}`).remove();
      } else {
        await db.ref(`surah_progress/${weekKey}/${req.userId}`).set(true);
      }

      return res.json({ learned: !isLearned });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error" });
    }
  }
);

// POST /surah — admin sets surah for a specific week
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res: Response) => {
    const { weekNumber, name, kazakh, transliteration } = req.body;

    if (!weekNumber || !name) {
      return res
        .status(400)
        .json({ error: "weekNumber and name are required" });
    }

    try {
      const weekKey = `week_${weekNumber}`;
      const surah = {
        weekNumber: Number(weekNumber),
        name,
        kazakh: kazakh || "",
        transliteration: transliteration || "",
        setAt: Date.now(),
      };
      await db.ref(`surah/${weekKey}`).set(surah);
      return res.status(201).json(surah);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;