import type { Express } from "express";
import { adminRouter } from "./admin";
import { healthRouter } from "./health";
import { publicRouter } from "./public";

export const registerRoutes = (app: Express) => {
  app.use("/api/health", healthRouter);
  app.use("/api/public", publicRouter);
  app.use("/api/admin", adminRouter);
};
