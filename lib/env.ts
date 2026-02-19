const required = ["DATABASE_URL", "SESSION_SECRET"] as const;
for (const key of required) {
  if (!process.env[key]) {
    console.warn(`Missing env: ${key}`);
  }
}

export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  sessionSecret: process.env.SESSION_SECRET ?? "dev-secret",
  allowedEmailDomain: process.env.ALLOWED_EMAIL_DOMAIN ?? "",
  magicTtlMin: Number(process.env.MAGIC_LINK_TTL_MINUTES ?? 15),
  resendKey: process.env.RESEND_API_KEY,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  smtpFrom: process.env.SMTP_FROM ?? "noreply@example.com",
  openaiKey: process.env.OPENAI_API_KEY
};
