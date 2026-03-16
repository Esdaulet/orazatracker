import { Router, Response } from "express";
import { db } from "../utils/firebase";
import {
  authMiddleware,
  adminMiddleware,
  AuthRequest,
} from "../middleware/auth";

const router = Router();

// GET /categories - все категории (доступно всем авторизованным)
router.get("/", authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await db.ref("categories").get();
    if (!snapshot.exists()) {
      return res.json([]);
    }
    const categories = snapshot.val();
    const result = Object.entries(categories).map(([id, data]: any) => ({
      id,
      ...data,
    }));
    return res.json(result);
  } catch (error) {
    console.error("Get categories error:", error);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

// POST /categories - создать категорию (только админ)
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res: Response) => {
    const { name, target, meaning, translation, order } = req.body;

    if (!name || target === undefined) {
      return res.status(400).json({ error: "Название и цель обязательны" });
    }

    try {
      const categoryId = `cat_${Date.now()}`;
      await db.ref(`categories/${categoryId}`).set({
        name,
        target: parseInt(target),
        meaning: meaning || "",
        translation: translation || "",
        order: parseInt(order) || 0,
        createdAt: Date.now(),
      });

      return res.status(201).json({
        id: categoryId,
        name,
        target: parseInt(target),
        meaning: meaning || "",
        translation: translation || "",
        order: parseInt(order) || 0,
      });
    } catch (error) {
      console.error("Create category error:", error);
      return res.status(500).json({ error: "Ошибка сервера" });
    }
  },
);

// PUT /categories/:id - обновить категорию (только админ)
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { name, target, meaning, translation, order } = req.body;

    try {
      const snapshot = await db.ref(`categories/${id}`).get();
      if (!snapshot.exists()) {
        return res.status(404).json({ error: "Категория не найдена" });
      }

      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (target !== undefined) updates.target = parseInt(target);
      if (meaning !== undefined) updates.meaning = meaning;
      if (translation !== undefined) updates.translation = translation;
      if (order !== undefined) updates.order = parseInt(order);

      await db.ref(`categories/${id}`).update(updates);

      return res.json({ id, ...snapshot.val(), ...updates });
    } catch (error) {
      console.error("Update category error:", error);
      return res.status(500).json({ error: "Ошибка сервера" });
    }
  },
);

// DELETE /categories/:id - удалить категорию (только админ)
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
      await db.ref(`categories/${id}`).remove();
      return res.json({ success: true });
    } catch (error) {
      console.error("Delete category error:", error);
      return res.status(500).json({ error: "Ошибка сервера" });
    }
  },
);

export default router;
