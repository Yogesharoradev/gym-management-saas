function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  mongoUrl: required("MONGO_URL"),
  dbName: required("DB_NAME"),
  jwtSecret: required("JWT_SECRET"),
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? "gymos_session",
} as const;

export const seedConfig = {
  superAdminEmail: process.env.SUPER_ADMIN_EMAIL ?? "owner@gymos.app",
  superAdminPassword: process.env.SUPER_ADMIN_PASSWORD ?? "SuperAdmin@123",
  superAdminName: process.env.SUPER_ADMIN_NAME ?? "Platform Owner",
  gymAdminEmail: process.env.GYM_ADMIN_EMAIL ?? "admin@ironpulse.in",
  gymAdminPassword: process.env.GYM_ADMIN_PASSWORD ?? "GymAdmin@123",
  gymAdminName: process.env.GYM_ADMIN_NAME ?? "Rahul Sharma",
  gymName: process.env.SEED_GYM_NAME ?? "Iron Pulse Fitness",
  gymPhone: process.env.SEED_GYM_PHONE ?? "+919876543210",
  gymEmail: process.env.SEED_GYM_EMAIL ?? "hello@ironpulse.in",
} as const;
