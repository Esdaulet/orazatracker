import { Router, Response } from "express";
import { db } from "../utils/firebase";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// POST /analytics/track — log user page view
router.post("/track", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { page } = req.body;

  if (!page) {
    return res.status(400).json({ error: "page is required" });
  }

  try {
    const timestamp = Date.now();
    const dateKey = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Get user data for displayName
    const userSnapshot = await db.ref(`users/${req.userId}`).get();
    const userData = userSnapshot.exists() ? userSnapshot.val() : {};

    const trackingData = {
      userId: req.userId,
      displayName: userData.displayName || "Unknown",
      page,
      timestamp,
      createdAt: new Date().toISOString(),
    };

    // Store with userId as key - overwrites previous entry for this user on this day
    // This keeps only the latest action per user per day
    await db
      .ref(`analytics/page-views/${dateKey}/${req.userId}`)
      .set(trackingData);

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET /analytics/views/:date — get all page views for a date (admin only)
router.get("/views/:date", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { date } = req.params;

  try {
    // Check if user is admin
    const userSnapshot = await db.ref(`users/${req.userId}`).get();
    const userData = userSnapshot.exists() ? userSnapshot.val() : {};

    if (userData.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const snapshot = await db.ref(`analytics/page-views/${date}`).get();

    if (!snapshot.exists()) {
      return res.json([]);
    }

    const views = snapshot.val();
    const viewsArray = Object.values(views).filter((v): v is any => v !== null);

    // Sort by timestamp descending (newest first)
    viewsArray.sort((a, b) => b.timestamp - a.timestamp);

    return res.json(viewsArray);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
