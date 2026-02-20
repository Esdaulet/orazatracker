import { Router, Response } from "express";
import { db } from "../utils/firebase";
import {
  authMiddleware,
  adminMiddleware,
  AuthRequest,
} from "../middleware/auth";

const router = Router();

// POST /tasks — admin only
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res: Response) => {
    const { date, name, target, unit, category } = req.body;

    if (!date || !name || !target || !unit) {
      return res.status(400).json({ error: "Заполни все поля" });
    }

    try {
      const taskId = `task_${Date.now()}`;
      const task = {
        id: taskId,
        date,
        name,
        target: Number(target),
        unit,
        category: category || "other",
        createdAt: Date.now(),
      };
      await db.ref(`tasks/${date}/${taskId}`).set(task);
      return res.status(201).json(task);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Ошибка сервера" });
    }
  },
);

// DELETE /tasks/:date/:taskId — admin only
router.delete(
  "/:date/:taskId",
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res: Response) => {
    const { date, taskId } = req.params;
    try {
      await db.ref(`tasks/${date}/${taskId}`).remove();
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Ошибка сервера" });
    }
  },
);

// GET /tasks/progress/:date — get my progress for a date (categories)
router.get(
  "/progress/:date",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const { date } = req.params;
    try {
      const snapshot = await db.ref(`progress/${req.userId}/${date}`).get();
      if (!snapshot.exists()) return res.json({});
      return res.json(snapshot.val());
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Ошибка сервера" });
    }
  },
);

// POST /tasks/progress — save counter count for a category
router.post(
  "/progress",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const { date, categoryId, count } = req.body;
    if (!date || !categoryId || count === undefined) {
      return res.status(400).json({ error: "Неверные данные" });
    }
    try {
      await db
        .ref(`progress/${req.userId}/${date}/${categoryId}`)
        .set(Number(count));
      return res.json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Ошибка сервера" });
    }
  },
);

// GET /tasks/community/:date — get all users' completed categories for a date
// Must come BEFORE /:date to match correctly
router.get(
  "/community/:date",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const { date } = req.params;
    try {
      // Get all categories first
      const categoriesSnapshot = await db.ref("categories").get();
      if (!categoriesSnapshot.exists()) {
        return res.json([]);
      }
      const categories = categoriesSnapshot.val();

      // Get all users
      const usersSnapshot = await db.ref("users").get();
      if (!usersSnapshot.exists()) {
        return res.json([]);
      }
      const users = usersSnapshot.val();

      // Build community progress
      const communityProgress = await Promise.all(
        Object.entries(users).map(async ([userId, userData]: any) => {
          const progressSnapshot = await db
            .ref(`progress/${userId}/${date}`)
            .get();

          let completedCategories: any[] = [];
          if (progressSnapshot.exists()) {
            const userProgress = progressSnapshot.val();
            completedCategories = Object.entries(userProgress)
              .filter(([categoryId, count]: any) => {
                const cat = categories[categoryId as string];
                return cat && Number(count) >= cat.target;
              })
              .map(([categoryId]: any) => ({
                id: categoryId,
                name: categories[categoryId as string]?.name || "Unknown",
              }));
          }

          return {
            userId,
            displayName: userData.displayName,
            photoURL: userData.photoURL || null,
            completedCount: completedCategories.length,
            completed: completedCategories,
          };
        })
      );

      // Sort by completed count (descending), then by name
      communityProgress.sort((a, b) => {
        if (b.completedCount !== a.completedCount) {
          return b.completedCount - a.completedCount;
        }
        return a.displayName.localeCompare(b.displayName);
      });

      return res.json(communityProgress);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Ошибка сервера" });
    }
  },
);

// GET /tasks/:date — all users can see tasks for a day
// Must come AFTER more specific routes
router.get(
  "/:date",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const { date } = req.params;
    try {
      const snapshot = await db.ref(`tasks/${date}`).get();
      if (!snapshot.exists()) return res.json([]);
      return res.json(Object.values(snapshot.val()));
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Ошибка сервера" });
    }
  },
);

export default router;
