import { Router, Response } from "express";
import { db } from "../utils/firebase";
import { authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /referrals/me - Get my referral info
router.get("/me", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const userRef = await db.ref(`users/${userId}`).get();

    if (!userRef.exists()) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userRef.val();
    const referralCode = user.referralCode || "";
    const sawapPoints = user.sawapPoints || 0;

    // Count referrals
    const referralsRef = await db.ref(`referrals/${userId}`).get();
    const referralCount = referralsRef.exists()
      ? Object.keys(referralsRef.val()).length
      : 0;

    return res.json({
      referralCode,
      sawapPoints,
      referralCount,
    });
  } catch (error) {
    console.error("Get referral error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET /referrals/list - Get list of people I invited
router.get(
  "/list",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      const referralsRef = await db.ref(`referrals/${userId}`).get();

      if (!referralsRef.exists()) {
        return res.json([]);
      }

      const referrals = referralsRef.val();
      const list = Object.values(referrals).map((ref: any) => ({
        refereeName: ref.refereeName,
        joinedAt: ref.joinedAt,
      }));

      return res.json(list);
    } catch (error) {
      console.error("Get referrals list error:", error);
      return res.status(500).json({ error: "Server error" });
    }
  },
);

export default router;
