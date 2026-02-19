import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getDateRange } from "@/lib/filters";

export async function GET(request: Request) {
  const user = await requireUser();
  if (user.role !== "SHIFT_LEAD") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sp = new URL(request.url).searchParams;
  const { from, to } = getDateRange(sp);
  const where = {
    createdAt: { gte: from, lte: to },
    issueTypeId: sp.get("issueType") || undefined,
    city: sp.get("city") || undefined,
    createdByUserId: sp.get("createdBy") || undefined
  };

  const rows = await prisma.feedback.findMany({ where, include: { issueType: true, createdBy: true }, orderBy: { createdAt: "desc" }, take: 5000 });
  const header = "createdAt,issueType,city,customerId,customerIp,agent,description\n";
  const body = rows
    .map((r) => `${r.createdAt.toISOString()},${r.issueType.title},${r.city},${r.customerId ?? r.simCardNumber ?? ""},${r.customerIp ?? r.connectedOperator ?? ""},${r.createdBy.fullName ?? r.createdBy.email},${(r.description ?? "").replaceAll(",", " ")}`)
    .join("\n");

  return new NextResponse(header + body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="feedbacks.csv"'
    }
  });
}
