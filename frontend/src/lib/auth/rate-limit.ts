import "server-only";
import { LoginAttemptModel } from "@/models/login-attempt.model";

const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

export async function checkLock(identifier: string): Promise<number | null> {
  const record = await LoginAttemptModel.findOne({ identifier });
  if (record?.lockedUntil && record.lockedUntil.getTime() > Date.now()) {
    return Math.ceil((record.lockedUntil.getTime() - Date.now()) / 60000);
  }
  return null;
}

export async function registerFailure(identifier: string): Promise<void> {
  const record = await LoginAttemptModel.findOne({ identifier });
  const count = (record?.count ?? 0) + 1;
  const lockedUntil =
    count >= MAX_ATTEMPTS
      ? new Date(Date.now() + LOCK_MINUTES * 60000)
      : null;
  await LoginAttemptModel.updateOne(
    { identifier },
    { $set: { count, lockedUntil } },
    { upsert: true },
  );
}

export async function clearAttempts(identifier: string): Promise<void> {
  await LoginAttemptModel.deleteOne({ identifier });
}
