import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { feedbackSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const parsed = feedbackSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" }, { status: 400 });
    }
    const data = parsed.data;
    const feedback = await prisma.feedback.create({
      data: {
        createdByUserId: user.id,
        issueTypeId: data.issueTypeId,
        customerId: data.customerId,
        customerIp: data.customerIp,
        city: data.city,
        centerName: data.centerName,
        simCardNumber: data.simCardNumber,
        connectedOperator: data.connectedOperator,
        area: data.area,
        description: data.description
      }
    });
    return NextResponse.json({ ok: true, feedback });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
