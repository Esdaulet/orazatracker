import { Router, Response } from "express";
import { db } from "../utils/firebase";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// POST /members/mark-new — called after user registration
router.post("/mark-new", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Get user data
    const userSnapshot = await db.ref(`users/${req.userId}`).get();
    const userData = userSnapshot.exists() ? userSnapshot.val() : {};

    // Mark this user as new in the new-members list
    await db.ref(`new-members/${today}/${req.userId}`).set({
      userId: req.userId,
      displayName: userData.displayName || "Unknown",
      createdAt: Date.now(),
    });

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET /members/new-unseen — get new members current user hasn't seen yet
router.get("/new-unseen", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {

    // Get new members from today and past (up to 7 days)
    const newMembersData: any[] = [];

    for (let i = 0; i < 7; i++) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - i);
      const dateKey = checkDate.toISOString().split("T")[0];

      const snapshot = await db.ref(`new-members/${dateKey}`).get();
      if (snapshot.exists()) {
        newMembersData.push(...Object.values(snapshot.val() as any[]));
      }
    }

    // Get list of members current user has already seen
    const seenSnapshot = await db
      .ref(`user-seen-members/${req.userId}`)
      .get();
    const seenMembers = seenSnapshot.exists()
      ? Object.keys(seenSnapshot.val())
      : [];

    // Filter out members already seen and current user
    const unseenMembers = newMembersData.filter(
      (member: any) =>
        member.userId !== req.userId && !seenMembers.includes(member.userId)
    );

    // Sort by date (newest first)
    unseenMembers.sort((a: any, b: any) => b.createdAt - a.createdAt);

    return res.json(unseenMembers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /members/mark-seen — mark a new member as seen by current user
router.post("/mark-seen", authMiddleware, async (req: AuthRequest, res: Response) => {
  const { memberId } = req.body;

  if (!memberId) {
    return res.status(400).json({ error: "memberId is required" });
  }

  try {
    await db
      .ref(`user-seen-members/${req.userId}/${memberId}`)
      .set(Date.now());
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
