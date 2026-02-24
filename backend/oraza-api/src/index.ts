import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import categoryRoutes from "./routes/categories";
import taskRoutes from "./routes/tasks";
import surahRoutes from "./routes/surah";
import analyticsRoutes from "./routes/analytics";
import membersRoutes from "./routes/members";
import referralsRoutes from "./routes/referrals";

setGlobalOptions({ maxInstances: 10 });

const app = express();

// CORS configuration - allow requests from frontend
app.use(
  cors({
    origin: true, // Allow all origins in Firebase Functions
    credentials: true,
  })
);

app.use(express.json());

// Handle preflight requests explicitly
app.options("*", cors());

// Health check endpoint
app.get("/health", (_req: any, res: any) => {
  res.json({ status: "ok", message: "Oraza Backend работает!" });
});

// Routes
app.use("/auth", authRoutes);
app.use("/categories", categoryRoutes);
app.use("/tasks", taskRoutes);
app.use("/surah", surahRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/members", membersRoutes);
app.use("/referrals", referralsRoutes);

// Export as Firebase Cloud Function
export const api = onRequest(app);
