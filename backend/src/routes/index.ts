import type { Express } from "express";
import { adminRouter } from "./admin";
import { authRouter } from "./auth";
import { healthRouter } from "./health";
import { publicRouter } from "./public";
import { authenticate, requireRole } from "../middleware/auth";

export const registerRoutes = (app: Express) => {
  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/public", publicRouter);
  app.use("/api/admin", authenticate, requireRole("admin"), adminRouter);
};
