import { type NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api";
import { forgotPasswordSchema } from "@/lib/validation/auth";
import { generateResetToken, RESET_TOKEN_TTL_MS } from "@/lib/auth/reset-token";
import { UserModel } from "@/models/user.model";
import { PasswordResetTokenModel } from "@/models/password-reset-token.model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GENERIC_MESSAGE =
  "If an account exists for that email, a password reset link has been sent.";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid request body", 400);
  }

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid input", 422);
  }

  const { email } = parsed.data;
  await connectToDatabase();
  const user = await UserModel.findOne({ email, isActive: true });

  // Never reveal whether an account exists.
  if (user) {
    await PasswordResetTokenModel.deleteMany({ userId: user._id });
    const { raw, hash } = generateResetToken();

    await PasswordResetTokenModel.create({
      userId: user._id,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      usedAt: null,
    });

    const origin = request.headers.get("origin") ?? "";
    const resetUrl = `${origin || "http://localhost:3000"}/reset-password?token=${raw}`;

    // Email delivery is not configured yet. Keep the URL server-side in
    // production; expose it only in development so the reset flow can be tested.
    // eslint-disable-next-line no-console
    console.log(`[password-reset] link for ${email}: ${resetUrl}`);

    if (process.env.NODE_ENV !== "production") {
      return jsonOk({ message: GENERIC_MESSAGE, resetUrl });
    }
  }

  return jsonOk({ message: GENERIC_MESSAGE });
}
