import { env } from "./config/env";
import { seedDatabase } from "./data/seed";
import { connectDatabase } from "./lib/mongo";
import { app } from "./app";

export const startServer = async () => {
  console.log(`Starting backend on port ${env.port}...`);
  const database = await connectDatabase();
  console.log(`MongoDB connected to ${env.mongoDb}`);

  if (env.seedDatabase) {
    console.log("Seeding database...");
    await seedDatabase(database);
    console.log("Database seed complete");
  }

  app.listen(env.port, () => {
    console.log(`Backend is running on port ${env.port}`);
  });
};