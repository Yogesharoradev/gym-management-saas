import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendPasswordResetEmailInput {
  to: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: SendPasswordResetEmailInput): Promise<void> {
  const from = process.env.RESEND_FROM;

  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!from) {
    throw new Error("RESEND_FROM is not configured");
  }

  const { error } = await resend.emails.send({
    from,
    to: [to],
    subject: "Reset your Fitaah password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Reset your Fitaah password</title>
        </head>

        <body
          style="
            margin: 0;
            padding: 0;
            background: #0a0a0a;
            font-family: Arial, Helvetica, sans-serif;
            color: #ffffff;
          "
        >
          <div style="padding: 40px 20px;">
            <div
              style="
                max-width: 560px;
                margin: 0 auto;
                background: #111111;
                border: 1px solid #262626;
                border-radius: 16px;
                padding: 36px;
              "
            >
              <div style="margin-bottom: 28px;">
                <h1
                  style="
                    margin: 0;
                    font-size: 28px;
                    font-weight: 700;
                    color: #34d399;
                  "
                >
                  Fitaah
                </h1>

                <p
                  style="
                    margin: 6px 0 0;
                    color: #737373;
                    font-size: 13px;
                  "
                >
                  Gym Management Platform
                </p>
              </div>

              <h2
                style="
                  margin: 0 0 14px;
                  font-size: 24px;
                  color: #ffffff;
                "
              >
                Reset your password
              </h2>

              <p
                style="
                  margin: 0 0 24px;
                  font-size: 15px;
                  line-height: 1.7;
                  color: #a3a3a3;
                "
              >
                We received a request to reset the password for your Fitaah
                account.
              </p>

              <a
                href="${resetUrl}"
                style="
                  display: inline-block;
                  padding: 13px 22px;
                  background: #34d399;
                  color: #07130e;
                  text-decoration: none;
                  border-radius: 10px;
                  font-size: 14px;
                  font-weight: 700;
                "
              >
                Reset Password
              </a>

              <p
                style="
                  margin: 24px 0 0;
                  font-size: 13px;
                  line-height: 1.6;
                  color: #737373;
                "
              >
                This link will expire in 30 minutes and can only be used once.
              </p>

              <div
                style="
                  margin-top: 28px;
                  padding-top: 20px;
                  border-top: 1px solid #262626;
                "
              >
                <p
                  style="
                    margin: 0;
                    font-size: 12px;
                    line-height: 1.6;
                    color: #525252;
                  "
                >
                  If you did not request a password reset, you can safely
                  ignore this email. Your password will remain unchanged.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }
}
