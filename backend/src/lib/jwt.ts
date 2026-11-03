import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { JwtPayload } from "../types";

const JWT_EXPIRATION = "7d";

export const signToken = (payload: JwtPayload): string => {
  if (!env.jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(payload, env.jwtSecret, { expiresIn: JWT_EXPIRATION });
};

export const verifyToken = (token: string): JwtPayload => {
  if (!env.jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.verify(token, env.jwtSecret) as JwtPayload;
};
