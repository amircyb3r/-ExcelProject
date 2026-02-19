import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createMagicToken } from "@/lib/auth";
import { sendAuthEmail } from "@/lib/mailer";
import { env } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email) return NextResponse.json({ error: "ایمیل الزامی است" }, { status: 400 });
  if (env.allowedEmailDomain && !email.endsWith(env.allowedEmailDomain)) {
    return NextResponse.json({ error: "دامنه ایمیل مجاز نیست" }, { status: 403 });
  }
  if (!rateLimit(`req:${email}`)) {
    return NextResponse.json({ error: "تعداد درخواست زیاد است" }, { status: 429 });
  }

  const user = await prisma.user.upsert({
    where: { email },
    create: { email },
    update: {}
  });
  const { rawCode, rawToken } = await createMagicToken(user.id);
  const link = `${env.appUrl}/login?token=${rawToken}`;
  await sendAuthEmail(email, rawCode, link);
  return NextResponse.json({ ok: true, message: "ایمیل ارسال شد" });
}
