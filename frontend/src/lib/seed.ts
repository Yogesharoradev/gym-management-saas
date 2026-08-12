import "server-only";
import { connectToDatabase } from "@/lib/db";
import { seedConfig } from "@/lib/env";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { UserModel } from "@/models/user.model";
import { GymModel } from "@/models/gym.model";
import { GYM_STATUS, SUBSCRIPTION_STATUS, ROLES } from "@/lib/constants";

let hasSeeded = false;

/** Idempotent seed of one Super Admin + one demo Gym with a Gym Admin. */
export async function seedDatabase(): Promise<void> {
  if (hasSeeded) return;
  await connectToDatabase();

  // Super Admin (no gym association)
  const superAdmin = await UserModel.findOne({ email: seedConfig.superAdminEmail });
  if (!superAdmin) {
    await UserModel.create({
      name: seedConfig.superAdminName,
      email: seedConfig.superAdminEmail,
      passwordHash: await hashPassword(seedConfig.superAdminPassword),
      role: ROLES.SUPER_ADMIN,
      gymId: null,
      isActive: true,
    });
  } else if (!(await verifyPassword(seedConfig.superAdminPassword, superAdmin.passwordHash))) {
    superAdmin.passwordHash = await hashPassword(seedConfig.superAdminPassword);
    await superAdmin.save();
  }

  // Demo Gym
  let gym = await GymModel.findOne({ name: seedConfig.gymName });
  if (!gym) {
    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + 30);
    gym = await GymModel.create({
      name: seedConfig.gymName,
      logo: null,
      phone: seedConfig.gymPhone,
      email: seedConfig.gymEmail,
      address: "MG Road, Bengaluru, Karnataka",
      status: GYM_STATUS.ACTIVE,
      subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE,
      subscriptionStartDate: now,
      subscriptionEndDate: end,
    });
  }

  // Gym Admin (scoped to the demo gym)
  const gymAdmin = await UserModel.findOne({ email: seedConfig.gymAdminEmail });
  if (!gymAdmin) {
    await UserModel.create({
      name: seedConfig.gymAdminName,
      email: seedConfig.gymAdminEmail,
      passwordHash: await hashPassword(seedConfig.gymAdminPassword),
      role: ROLES.GYM_ADMIN,
      gymId: gym._id,
      isActive: true,
    });
  } else {
    let dirty = false;
    if (!gymAdmin.gymId) {
      gymAdmin.gymId = gym._id;
      dirty = true;
    }
    if (!(await verifyPassword(seedConfig.gymAdminPassword, gymAdmin.passwordHash))) {
      gymAdmin.passwordHash = await hashPassword(seedConfig.gymAdminPassword);
      dirty = true;
    }
    if (dirty) await gymAdmin.save();
  }

  hasSeeded = true;
}
