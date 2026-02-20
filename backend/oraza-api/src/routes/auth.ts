import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { db, storage } from "../utils/firebase";
import { generateToken, ADMIN_USER_ID, authMiddleware, AuthRequest } from "../middleware/auth";

const router = Router();

// POST /auth/register
router.post("/register", async (req: Request, res: Response) => {
  const { phone, password, displayName } = req.body;

  if (!phone || !password || !displayName) {
    return res.status(400).json({ error: "Заполни все поля" });
  }

  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) {
    return res.status(400).json({ error: "Неверный формат номера" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Пароль минимум 6 символов" });
  }

  try {
    // Check if phone already exists
    const usersRef = db.ref("users");
    const snapshot = await usersRef.get();

    if (snapshot.exists()) {
      const users = snapshot.val();
      const existingUser = Object.values(users).find(
        (u: any) => u.phone === digits,
      );
      if (existingUser) {
        return res
          .status(400)
          .json({ error: "Этот номер уже зарегистрирован" });
      }
    }

    // Generate unique user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const role = userId === ADMIN_USER_ID ? "admin" : "user";

    // Save user to Firebase
    await db.ref(`users/${userId}`).set({
      userId,
      phone: digits,
      displayName,
      password: hashedPassword,
      role,
      createdAt: Date.now(),
    });

    const token = generateToken(userId, digits, displayName, role);

    return res.status(201).json({
      token,
      user: { userId, phone: digits, displayName },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

// POST /auth/login
router.post("/login", async (req: Request, res: Response) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ error: "Введи номер и пароль" });
  }

  const digits = phone.replace(/\D/g, "");

  try {
    // Find user by phone
    const usersRef = db.ref("users");
    const snapshot = await usersRef.get();

    if (!snapshot.exists()) {
      return res.status(401).json({ error: "Неверный номер или пароль" });
    }

    const users = snapshot.val();
    const userData = Object.values(users).find(
      (u: any) => u.phone === digits,
    ) as any;

    if (!userData) {
      return res.status(401).json({ error: "Неверный номер или пароль" });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, userData.password);
    if (!isValid) {
      return res.status(401).json({ error: "Неверный номер или пароль" });
    }

    // Auto-upgrade role if this is the admin user ID
    let role = userData.role || "user";
    if (userData.userId === ADMIN_USER_ID && role !== "admin") {
      role = "admin";
      await db.ref(`users/${userData.userId}/role`).set("admin");
    }

    const token = generateToken(
      userData.userId,
      digits,
      userData.displayName,
      role,
    );

    return res.json({
      token,
      user: {
        userId: userData.userId,
        phone: userData.phone,
        displayName: userData.displayName,
        role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Ошибка сервера" });
  }
});

// POST /auth/upload-photo — upload user profile photo from base64
router.post(
  "/upload-photo",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const { image, fileName, mimeType } = req.body;

    if (!image || !fileName) {
      return res.status(400).json({ error: "Зображення немає" });
    }

    try {
      // Convert base64 to buffer - handle both with and without data URI prefix
      let base64Data = image;
      if (image.startsWith("data:")) {
        // Remove data URI prefix: data:image/png;base64, or data:image/jpeg;base64,
        base64Data = image.split(",")[1] || image;
      }

      const fileBuffer = Buffer.from(base64Data, "base64");

      // Validate base64 conversion
      if (!fileBuffer || fileBuffer.length === 0) {
        return res.status(400).json({ error: "Невірні дані зображення" });
      }

      // Generate storage path
      const storagePath = `profile-photos/${req.userId}_${Date.now()}.jpg`;
      const file = storage.bucket().file(storagePath);

      // Generate a download token (Firebase Storage uses this format)
      const downloadToken = crypto.randomUUID();

      // Upload to Firebase Storage with download token in metadata
      await file.save(fileBuffer, {
        metadata: {
          contentType: mimeType || "image/jpeg",
          metadata: {
            firebaseStorageDownloadTokens: downloadToken,
          },
        },
      });

      // Construct Firebase Storage public download URL
      const bucketName = storage.bucket().name;
      const encodedPath = encodeURIComponent(storagePath);
      const url = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media&token=${downloadToken}`;

      // Save photo URL to user profile
      await db.ref(`users/${req.userId}/photoURL`).set(url);

      return res.json({ photoURL: url });
    } catch (error) {
      console.error("Upload error:", error);
      return res.status(500).json({ error: "Ошибка загрузки" });
    }
  }
);

// GET /auth/me — get current user profile from DB (includes photoURL)
router.get(
  "/me",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    try {
      const snapshot = await db.ref(`users/${req.userId}`).get();
      if (!snapshot.exists()) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }
      const userData = snapshot.val();
      return res.json({
        userId: userData.userId,
        displayName: userData.displayName,
        photoURL: userData.photoURL || null,
        role: userData.role,
      });
    } catch (error) {
      console.error("Get profile error:", error);
      return res.status(500).json({ error: "Ошибка сервера" });
    }
  }
);

// POST /auth/save-photo-url — save photo URL to user profile
router.post(
  "/save-photo-url",
  authMiddleware,
  async (req: AuthRequest, res: Response) => {
    const { photoURL } = req.body;

    if (!photoURL || typeof photoURL !== "string") {
      return res.status(400).json({ error: "Неверный URL" });
    }

    try {
      await db.ref(`users/${req.userId}/photoURL`).set(photoURL);
      return res.json({ photoURL });
    } catch (error) {
      console.error("Save photo error:", error);
      return res.status(500).json({ error: "Ошибка сервера" });
    }
  }
);

export default router;
