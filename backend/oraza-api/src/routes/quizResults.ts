import { Router, Response } from "express";
import { db } from "../utils/firebase";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// POST /quiz-results/:date — save quiz result for authenticated user
router.post("/:date", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { date } = req.params;
    const userId = req.userId!;
    const result = req.body;

    const timestamp = Date.now();
    await db.ref(`quiz-results/${userId}/${date}_${timestamp}`).set(result);

    res.json({ success: true });
  } catch (error) {
    console.error("Error saving quiz result:", error);
    res.status(500).json({ error: "Failed to save quiz result" });
  }
});

export default router;