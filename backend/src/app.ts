import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { registerRoutes } from "./routes";

const allowedOrigins = env.clientOrigin.split(",").map((origin) => origin.trim()).filter(Boolean);

export const app = express();

app.use(
  cors({
    origin: allowedOrigins.includes("*") ? true : allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: "25mb" }));

registerRoutes(app);