import "server-only";

interface PasswordResetEmailInput {
  to: string;
  resetUrl: string;
}

/**
 * Temporary mail adapter boundary.
 * Replace the transport implementation here when an email provider is configured.
 */
export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: PasswordResetEmailInput): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[password-reset] email to ${to}: ${resetUrl}`);
    return;
  }

  if (!process.env.PASSWORD_RESET_EMAIL_WEBHOOK_URL) {
    throw new Error("Password reset email provider is not configured");
  }

  const response = await fetch(process.env.PASSWORD_RESET_EMAIL_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, resetUrl }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to send password reset email");
  }
}
