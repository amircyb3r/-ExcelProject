import { z } from "zod";
import { SPECIAL_ISSUES } from "@/lib/constants";

export const feedbackSchema = z
  .object({
    issueTypeId: z.string().uuid(),
    issueTypeTitle: z.string(),
    customerId: z.string().optional(),
    customerIp: z.string().optional(),
    city: z.string().min(2),
    centerName: z.string().optional(),
    simCardNumber: z.string().optional(),
    connectedOperator: z.string().optional(),
    area: z.string().optional(),
    description: z.string().optional()
  })
  .superRefine((data, ctx) => {
    if (SPECIAL_ISSUES.includes(data.issueTypeTitle)) {
      if (!data.simCardNumber) ctx.addIssue({ code: "custom", message: "شماره سیم‌کارت الزامی است." });
      if (!data.connectedOperator) ctx.addIssue({ code: "custom", message: "اپراتور متصل الزامی است." });
      if (!data.area) ctx.addIssue({ code: "custom", message: "منطقه الزامی است." });
    } else {
      if (!data.customerId) ctx.addIssue({ code: "custom", message: "شناسه مشترک الزامی است." });
      if (!data.customerIp) ctx.addIssue({ code: "custom", message: "IP مشترک الزامی است." });
      if (!data.centerName) ctx.addIssue({ code: "custom", message: "نام مرکز الزامی است." });
    }
  });
