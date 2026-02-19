import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getDateRange } from "@/lib/filters";

export async function GET(request: Request) {
  const user = await requireUser();
  const sp = new URL(request.url).searchParams;
  const { from, to } = getDateRange(sp);
  const query = sp.get("q") ?? "";

  const where = {
    createdAt: { gte: from, lte: to },
    issueTypeId: sp.get("issueType") || undefined,
    city: sp.get("city") || undefined,
    createdByUserId: user.role === "SHIFT_LEAD" ? sp.get("createdBy") || undefined : user.id,
    OR: query
      ? [
          { customerId: { contains: query, mode: "insensitive" as const } },
          { customerIp: { contains: query, mode: "insensitive" as const } },
          { simCardNumber: { contains: query, mode: "insensitive" as const } },
          { description: { contains: query, mode: "insensitive" as const } }
        ]
      : undefined
  };

  const [rows, issueList, users] = await Promise.all([
    prisma.feedback.findMany({ where, include: { issueType: true, createdBy: true }, orderBy: { createdAt: "desc" }, take: 500 }),
    prisma.issueType.findMany({ orderBy: { title: "asc" } }),
    user.role === "SHIFT_LEAD" ? prisma.user.findMany({ select: { id: true, fullName: true, email: true } }) : Promise.resolve([])
  ]);

  return NextResponse.json({ rows, issueList, users });
}
