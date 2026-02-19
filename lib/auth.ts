import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { randomBytes, createHash } from "crypto";
import { addMinutes } from "date-fns";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "cc_session";
const secret = new TextEncoder().encode(env.sessionSecret);

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function createMagicToken(userId: string) {
  const rawCode = `${Math.floor(100000 + Math.random() * 900000)}`;
  const rawToken = randomBytes(24).toString("hex");
  await prisma.magicToken.create({
    data: {
      userId,
      codeHash: sha256(rawCode),
      tokenHash: sha256(rawToken),
      expiresAt: addMinutes(new Date(), env.magicTtlMin)
    }
  });
  return { rawCode, rawToken };
}

export async function createSession(userId: string) {
  const raw = randomBytes(32).toString("hex");
  await prisma.session.create({
    data: {
      userId,
      tokenHash: sha256(raw),
      expiresAt: addMinutes(new Date(), 60 * 12)
    }
  });

  const jwt = await new SignJWT({ token: raw })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("12h")
    .sign(secret);

  cookies().set(COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
}

export async function getSessionUser() {
  const cookie = cookies().get(COOKIE_NAME)?.value;
  if (!cookie) return null;
  try {
    const verified = await jwtVerify(cookie, secret);
    const token = (verified.payload.token as string) ?? "";
    const session = await prisma.session.findUnique({
      where: { tokenHash: sha256(token) },
      include: { user: true }
    });
    if (!session || session.expiresAt < new Date()) return null;
    return session.user;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}
