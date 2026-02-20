import { Router, Response } from "express";
import { db } from "../utils/firebase";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// All routes require auth
router.use(authMiddleware);

// GET /habits - get all habits for user
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await db.ref(`habits/${req.userId}`).get();

    if (!snapshot.exists()) {
      return res.json([]);
    }

    const habits = Object.values(snapshot.val());
    return res.json(habits);
  } catch (error) {
    console.error("Get habits error:", error);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

// POST /habits - create new habit
router.post("/", async (req: AuthRequest, res: Response) => {
  const { name, description, category, target, unit } = req.body;

  if (!name || !category || !target || !unit) {
    return res.status(400).json({ error: "Заполни все обязательные поля" });
  }

  try {
    const habitId = `habit_${Date.now()}`;

    const habit = {
      id: habitId,
      userId: req.userId,
      name,
      description: description || "",
      category,
      target: Number(target),
      unit,
      createdAt: Date.now(),
    };

    await db.ref(`habits/${req.userId}/${habitId}`).set(habit);

    return res.status(201).json(habit);
  } catch (error) {
    console.error("Create habit error:", error);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

// DELETE /habits/:id - delete habit
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    await db.ref(`habits/${req.userId}/${id}`).remove();
    return res.json({ success: true });
  } catch (error) {
    console.error("Delete habit error:", error);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

// GET /habits/logs/:date - get logs for a specific day
router.get("/logs/:date", async (req: AuthRequest, res: Response) => {
  const { date } = req.params;

  try {
    const snapshot = await db.ref(`habitLogs/${req.userId}/${date}`).get();

    if (!snapshot.exists()) {
      return res.json({});
    }

    return res.json(snapshot.val());
  } catch (error) {
    console.error("Get logs error:", error);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

// POST /habits/logs - log habit progress
router.post("/logs", async (req: AuthRequest, res: Response) => {
  const { habitId, date, completed } = req.body;

  if (!habitId || !date || completed === undefined) {
    return res.status(400).json({ error: "Неверные данные" });
  }

  try {
    const log = {
      habitId,
      userId: req.userId,
      date,
      completed: Number(completed),
      timestamp: Date.now(),
    };

    await db.ref(`habitLogs/${req.userId}/${date}/${habitId}`).set(log);

    return res.json(log);
  } catch (error) {
    console.error("Log habit error:", error);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

export default router;
