import * as z from "zod";

const envSchema = z.object({
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is missing from your .env.local file!"),
});

export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
      console.error("❌ Invalid environment configurations at startup:");
      console.error(result.error.format());
      process.exit(1); // Safely halt the server immediately to prevent runtime bugs
    }

    console.log("✅ Environment configurations successfully verified.");
  }
}
