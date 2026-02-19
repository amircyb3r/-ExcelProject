import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { requireUser } from "@/lib/auth";
import { getDateRange } from "@/lib/filters";

type CacheEntry = { value: string; at: number };
const cache = new Map<string, CacheEntry>();

export async function GET(request: Request) {
  await requireUser();
  const sp = new URL(request.url).searchParams;
  const { from, to } = getDateRange(sp);
  const cacheKey = `${from.toISOString()}::${to.toISOString()}`;

  const now = Date.now();
  const hit = cache.get(cacheKey);
  if (hit && now - hit.at < 60_000) return NextResponse.json({ analysis: hit.value, cached: true });

  const [feedbacks, topIssues, topCities] = await Promise.all([
    prisma.feedback.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: { createdAt: true, issueType: { select: { title: true } }, city: true }
    }),
    prisma.feedback.groupBy({ by: ["issueTypeId"], where: { createdAt: { gte: from, lte: to } }, _count: true, orderBy: { _count: { issueTypeId: "desc" } }, take: 5 }),
    prisma.feedback.groupBy({ by: ["city"], where: { createdAt: { gte: from, lte: to } }, _count: true, orderBy: { _count: { city: "desc" } }, take: 5 })
  ]);

  const issues = await prisma.issueType.findMany({ where: { id: { in: topIssues.map((x) => x.issueTypeId) } } });

  const buckets = new Map<string, number>();
  for (const row of feedbacks) {
    const d = new Date(row.createdAt);
    d.setMinutes(Math.floor(d.getMinutes() / 10) * 10, 0, 0);
    const key = d.toISOString();
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  const trend = [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([time, count]) => ({ time, count }));

  const payload = {
    topIssues: topIssues.map((x) => ({ issueType: issues.find((i) => i.id === x.issueTypeId)?.title, count: x._count.issueTypeId })),
    topCities: topCities.map((x) => ({ city: x.city, count: x._count.city })),
    trend
  };

  if (!env.openaiKey) {
    const fallback = `گزارش بازه انتخابی: پرتکرارترین مشکلات ${JSON.stringify(payload.topIssues)} و پرتکرارترین شهرها ${JSON.stringify(payload.topCities)}.`;
    cache.set(cacheKey, { value: fallback, at: now });
    return NextResponse.json({ analysis: fallback });
  }

  const client = new OpenAI({ apiKey: env.openaiKey });
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "تو فقط گزارش آماری کوتاه فارسی می‌نویسی. هیچ راهکار، پیشنهاد عملیاتی یا توصیه رفع مشکل ارائه نده." },
      { role: "user", content: `فقط گزارش کن: پرتکرارترین issueTypeها، شهرهای پرتکرار و وجود/عدم وجود spike زمانی بر اساس داده ${JSON.stringify(payload)}.` }
    ]
  });
  const analysis = completion.choices[0]?.message.content ?? "تحلیل تولید نشد";
  cache.set(cacheKey, { value: analysis, at: now });
  return NextResponse.json({ analysis });
}
