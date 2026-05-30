// import { User } from "../src/types/user";

async function main() {
  console.log("🌱 Starting database sync and seeding...");

  try {
    // 1. Place your table generation/sync code here (e.g., prisma.$executeRaw, drizzle migrate, etc.)
    // 2. Insert your default mock data:
    const mockUser = {
      id: "1234",
      name: "Test user",
      email: "test@test.com",
      role: "admin",
      avatarUrl: "",
      createdAt: Date.now().toString(),
      updatedAt: Date.now().toString(),
    };

    console.log(`Inserting mock user: ${mockUser.email}`);
    // await db.insert(users).values(mockUser); // Your actual database insertion logic goes here

    console.log("✅ Seeding completed successfully.");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}
