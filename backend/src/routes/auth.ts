import { Router } from "express";
import bcrypt from "bcryptjs";
import { getCollection } from "../lib/mongo";
import { signToken } from "../lib/jwt";
import { ensureCustomerProfileForUser } from "../lib/customerSync";
import { authenticate } from "../middleware/auth";
import type { UserRecord } from "../types";

export const authRouter = Router();

const BCRYPT_ROUNDS = 12;

/** Strips passwordHash from a UserRecord before sending to client */
const toSafeUser = (user: UserRecord) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// ─── POST /api/auth/register ─────────────────────────────────────────────────

authRouter.post("/register", async (req, res) => {
  try {
    const body = req.body ?? {};
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    // Basic email format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const users = getCollection<UserRecord>("users");

    // Check for duplicate email
    const existing = await users.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const now = new Date();
    const user: UserRecord = {
      id: `U-${Date.now()}`,
      name,
      email,
      passwordHash,
      role: "customer", // Public registration ALWAYS creates a customer
      createdAt: now,
      updatedAt: now,
    };

    await users.insertOne(user);

    // Automatically create or link corresponding customer profile
    await ensureCustomerProfileForUser(user);

    // Generate JWT
    const token = signToken({ userId: user.id, role: user.role });

    res.status(201).json({
      user: toSafeUser(user),
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// ─── POST /api/auth/login ────────────────────────────────────────────────────

authRouter.post("/login", async (req, res) => {
  try {
    const body = req.body ?? {};
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const users = getCollection<UserRecord>("users");
    const user = await users.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT
    const token = signToken({ userId: user.id, role: user.role });

    res.json({
      user: toSafeUser(user),
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// ─── GET /api/auth/me ────────────────────────────────────────────────────────

authRouter.get("/me", authenticate, async (req, res) => {
  try {
    const users = getCollection<UserRecord>("users");
    const user = await users.findOne({ id: req.user!.userId });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({ user: toSafeUser(user) });
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});
