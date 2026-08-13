import { type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api";
import { resetPasswordSchema } from "@/lib/validation/auth";
import { hashResetToken } from "@/lib/auth/reset-token";
import { hashPassword } from "@/lib/auth/password";
import { UserModel } from "@/models/user.model";
import { PasswordResetTokenModel } from "@/models/password-reset-token.model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INVALID_TOKEN = "This reset link is invalid or has expired";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
  }
  const { token, password } = parsed.data;

  await connectToDatabase();

  const tokenHash = hashResetToken(token);
  const record = await PasswordResetTokenModel.findOne({ tokenHash });

  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return jsonError(INVALID_TOKEN, 400);
  }

  const user = await UserModel.findById(record.userId);
  if (!user || !user.isActive) {
    return jsonError(INVALID_TOKEN, 400);
  }

  // Update password and stamp passwordChangedAt to invalidate existing sessions.
  user.passwordHash = await hashPassword(password);
  user.passwordChangedAt = new Date();
  await user.save();

  // Consume this token and purge any other outstanding tokens for the user.
  record.usedAt = new Date();
  await record.save();
  await PasswordResetTokenModel.deleteMany({
    userId: user._id,
    _id: { $ne: record._id },
  });

  return jsonOk({ success: true });
}
