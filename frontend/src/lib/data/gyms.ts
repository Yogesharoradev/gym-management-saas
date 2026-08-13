import "server-only";
import { isValidObjectId } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { GymModel, type IGym } from "@/models/gym.model";
import { UserModel, type IUser } from "@/models/user.model";
import { GYM_STATUS, SUBSCRIPTION_STATUS, ROLES, type GymStatus } from "@/lib/constants";
import type { CreateGymInput, UpdateGymInput } from "@/lib/validation/gym";

export interface SerializedGym {
  id: string;
  name: string;
  logo: string | null;
  phone: string;
  email: string;
  address: string;
  status: string;
  subscriptionStatus: string;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SerializedAdmin {
  id: string;
  name: string;
  email: string;
  role: string;
  gymId: string | null;
  isActive: boolean;
}

export function serializeGym(gym: IGym): SerializedGym {
  return {
    id: gym._id.toString(),
    name: gym.name,
    logo: gym.logo,
    phone: gym.phone,
    email: gym.email,
    address: gym.address,
    status: gym.status,
    subscriptionStatus: gym.subscriptionStatus,
    subscriptionStartDate: gym.subscriptionStartDate
      ? gym.subscriptionStartDate.toISOString()
      : null,
    subscriptionEndDate: gym.subscriptionEndDate
      ? gym.subscriptionEndDate.toISOString()
      : null,
    createdAt: gym.createdAt.toISOString(),
    updatedAt: gym.updatedAt.toISOString(),
  };
}

/** Never exposes passwordHash. */
export function serializeAdmin(user: IUser): SerializedAdmin {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    gymId: user.gymId ? user.gymId.toString() : null,
    isActive: user.isActive,
  };
}

export async function listGyms(): Promise<SerializedGym[]> {
  await connectToDatabase();
  const gyms = await GymModel.find().sort({ createdAt: -1 });
  return gyms.map(serializeGym);
}

export async function getGymById(id: string): Promise<SerializedGym | null> {
  if (!isValidObjectId(id)) return null;
  await connectToDatabase();
  const gym = await GymModel.findById(id);
  return gym ? serializeGym(gym) : null;
}

export type CreateGymResult =
  | { ok: true; gym: SerializedGym; admin: SerializedAdmin }
  | { ok: false; code: "EMAIL_TAKEN" };

/**
 * Creates a Gym and its initial Gym Admin. Standalone MongoDB has no
 * multi-document transactions, so we guard against partial creation by
 * pre-checking the admin email and compensating (deleting the gym) if the
 * user write fails.
 */
export async function createGymWithAdmin(
  input: CreateGymInput,
): Promise<CreateGymResult> {
  await connectToDatabase();

  const adminEmail = input.admin.email;
  const existing = await UserModel.findOne({ email: adminEmail }).lean();
  if (existing) return { ok: false, code: "EMAIL_TAKEN" };

  const passwordHash = await hashPassword(input.admin.password);
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + 30);

  const gym = await GymModel.create({
    name: input.name,
    email: input.email ?? "",
    phone: input.phone ?? "",
    address: input.address ?? "",
    logo: input.logo ?? null,
    status: GYM_STATUS.ACTIVE,
    subscriptionStatus: input.subscriptionStatus ?? SUBSCRIPTION_STATUS.ACTIVE,
    subscriptionStartDate: now,
    subscriptionEndDate: end,
  });

  try {
    const admin = await UserModel.create({
      name: input.admin.name,
      email: adminEmail,
      passwordHash,
      role: ROLES.GYM_ADMIN,
      gymId: gym._id,
      isActive: true,
    });
    return { ok: true, gym: serializeGym(gym), admin: serializeAdmin(admin) };
  } catch {
    // Compensate the partial creation (e.g., duplicate-email race).
    await GymModel.deleteOne({ _id: gym._id });
    return { ok: false, code: "EMAIL_TAKEN" };
  }
}

export async function updateGym(
  id: string,
  patch: UpdateGymInput,
): Promise<SerializedGym | null> {
  if (!isValidObjectId(id)) return null;
  await connectToDatabase();

  const update: Record<string, unknown> = {};
  if (patch.name !== undefined) update.name = patch.name;
  if (patch.email !== undefined) update.email = patch.email;
  if (patch.phone !== undefined) update.phone = patch.phone;
  if (patch.address !== undefined) update.address = patch.address;
  if (patch.logo !== undefined) update.logo = patch.logo;
  if (patch.subscriptionStatus !== undefined)
    update.subscriptionStatus = patch.subscriptionStatus;
  if (patch.subscriptionEndDate !== undefined)
    update.subscriptionEndDate = patch.subscriptionEndDate
      ? new Date(patch.subscriptionEndDate)
      : null;

  const gym = await GymModel.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true, runValidators: true },
  );
  return gym ? serializeGym(gym) : null;
}

/**
 * Suspends or activates a gym. Business data is never deleted — only the gym
 * status and subscription state change.
 */
export async function setGymStatus(
  id: string,
  status: GymStatus,
): Promise<SerializedGym | null> {
  if (!isValidObjectId(id)) return null;
  await connectToDatabase();

  const update =
    status === GYM_STATUS.SUSPENDED
      ? {
          status: GYM_STATUS.SUSPENDED,
          subscriptionStatus: SUBSCRIPTION_STATUS.SUSPENDED,
        }
      : {
          status: GYM_STATUS.ACTIVE,
          subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE,
        };

  const gym = await GymModel.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true },
  );
  return gym ? serializeGym(gym) : null;
}
