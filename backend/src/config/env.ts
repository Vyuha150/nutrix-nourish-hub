import "dotenv/config";

const numberOrDefault = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: numberOrDefault(process.env.PORT, 3000),
  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017",
  mongoDb: process.env.MONGODB_DB ?? "nutrix",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:8080",
  seedDatabase: (process.env.SEED_DATABASE ?? "true").toLowerCase() !== "false",
  jwtSecret: process.env.JWT_SECRET ?? "",
  adminEmail: process.env.ADMIN_EMAIL ?? "",
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  adminName: process.env.ADMIN_NAME ?? "",
};