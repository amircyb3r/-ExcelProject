import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, sha256 } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const { email, code, token, fullName } = await request.json();
  if (!rateLimit(`verify:${email}`, 10, 60_000)) {
    return NextResponse.json({ error: "تعداد تلاش زیاد است" }, { status: 429 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });

  const orConditions = [];
  if (code) orConditions.push({ codeHash: sha256(code) });
  if (token) orConditions.push({ tokenHash: sha256(token) });
  if (orConditions.length === 0) {
    return NextResponse.json({ error: "کد یا لینک لازم است" }, { status: 400 });
  }

  const magic = await prisma.magicToken.findFirst({
    where: {
      userId: user.id,
      consumedAt: null,
      expiresAt: { gt: new Date() },
      OR: orConditions
    }
  });

  if (!magic) return NextResponse.json({ error: "کد/لینک نامعتبر" }, { status: 400 });

  await prisma.magicToken.update({ where: { id: magic.id }, data: { consumedAt: new Date() } });
  if (!user.fullName && fullName) {
    await prisma.user.update({ where: { id: user.id }, data: { fullName } });
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
