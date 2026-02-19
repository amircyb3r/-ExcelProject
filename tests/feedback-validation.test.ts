import { describe, expect, it } from "vitest";
import { feedbackSchema } from "../lib/validators";

describe("feedback validation", () => {
  it("requires normal fields for standard issue", () => {
    const res = feedbackSchema.safeParse({ issueTypeId: "550e8400-e29b-41d4-a716-446655440000", issueTypeTitle: "PTP", city: "تهران" });
    expect(res.success).toBe(false);
  });

  it("requires mobile-specific fields", () => {
    const res = feedbackSchema.safeParse({
      issueTypeId: "550e8400-e29b-41d4-a716-446655440000",
      issueTypeTitle: "اسکای فایبریا شاتل موبایل no page",
      city: "تهران",
      simCardNumber: "0912",
      connectedOperator: "MCI",
      area: "منطقه ۲"
    });
    expect(res.success).toBe(true);
  });
});
