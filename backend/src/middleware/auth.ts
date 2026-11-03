import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";
import { getCollection } from "../lib/mongo";
import type { JwtPayload, UserRecord, UserRole } from "../types";

// Extend Express Request to carry authenticated user info
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Authentication middleware.
 * Reads the Authorization: Bearer <token> header, verifies the JWT,
 * and attaches the decoded payload to req.user.
 * Returns 401 if the token is missing, malformed, invalid, or expired.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: "Authorization header is required" });
    return;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    res.status(401).json({ error: "Authorization header must be: Bearer <token>" });
    return;
  }

  const token = parts[1]!;

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * Role authorization middleware factory.
 * Must be used AFTER `authenticate`.
 * Returns 403 if the authenticated user does not have the required role.
 */
export const requireRole = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    try {
      // Dynamic verification against database to avoid trusting stale JWT role
      const users = getCollection<UserRecord>("users");
      const dbUser = await users.findOne({ id: req.user.userId });

      if (!dbUser) {
        res.status(401).json({ error: "User not found" });
        return;
      }

      // Update req.user with fresh role from database
      req.user.role = dbUser.role;

      if (!roles.includes(dbUser.role)) {
        res.status(403).json({ error: "Insufficient permissions" });
        return;
      }

      next();
    } catch {
      res.status(500).json({ error: "Authorization check failed" });
    }
  };
};
