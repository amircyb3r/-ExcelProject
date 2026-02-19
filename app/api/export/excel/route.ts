import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
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

  const rows = await prisma.feedback.findMany({ where, include: { issueType: true, createdBy: true }, take: 5000 });

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("feedbacks");
  ws.columns = [
    { header: "زمان", key: "createdAt" },
    { header: "نوع مشکل", key: "issue" },
    { header: "شهر", key: "city" },
    { header: "شناسه/سیمکارت", key: "customerId" },
    { header: "IP/اپراتور", key: "ip" },
    { header: "کارشناس", key: "agent" },
    { header: "توضیحات", key: "description" }
  ];
  rows.forEach((r) => ws.addRow({ createdAt: r.createdAt.toISOString(), issue: r.issueType.title, city: r.city, customerId: r.customerId ?? r.simCardNumber, ip: r.customerIp ?? r.connectedOperator, agent: r.createdBy.email, description: r.description ?? "" }));
  const buffer = await wb.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="feedbacks.xlsx"'
    }
  });
}
