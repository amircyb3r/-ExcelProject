import { NextResponse } from "next/server";
import { subHours, subMinutes } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET() {
  await requireUser();
  const now = new Date();
  const startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [today, lastHour, last10, topIssues, topCities] = await Promise.all([
    prisma.feedback.count({ where: { createdAt: { gte: startDay } } }),
    prisma.feedback.count({ where: { createdAt: { gte: subHours(now, 1) } } }),
    prisma.feedback.count({ where: { createdAt: { gte: subMinutes(now, 10) } } }),
    prisma.feedback.groupBy({ by: ["issueTypeId"], _count: true, orderBy: { _count: { issueTypeId: "desc" } }, take: 5 }),
    prisma.feedback.groupBy({ by: ["city"], _count: true, orderBy: { _count: { city: "desc" } }, take: 5 })
  ]);

  const issues = await prisma.issueType.findMany({ where: { id: { in: topIssues.map((x) => x.issueTypeId) } } });
  return NextResponse.json({
    today,
    lastHour,
    last10,
    topIssues: topIssues.map((x) => ({ issueType: issues.find((i) => i.id === x.issueTypeId)?.title, count: x._count })),
    topCities: topCities.map((x) => ({ city: x.city, count: x._count.city }))
  });
}
