export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { seedDatabase } = await import("@/lib/seed");
    try {
      await seedDatabase();
      // eslint-disable-next-line no-console
      console.log("[seed] database seeded");
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[seed] failed", error);
    }
  }
}
