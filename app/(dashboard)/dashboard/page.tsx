import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { DashboardClient } from "@/components/dashboard-client";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const issueTypes = await prisma.issueType.findMany({ orderBy: { title: "asc" } });

  return (
    <main className="mx-auto max-w-7xl p-6">
      <div className="mb-6 rounded-xl bg-brand-blue p-4 text-white shadow">
        <h1 className="text-2xl font-bold">داشبورد پشتیبانی فنی اینترنت</h1>
        <p className="text-sm">خوش آمدید {user.fullName ?? user.email} | نقش: {user.role === "SHIFT_LEAD" ? "سرشیفت" : "کارشناس"}</p>
      </div>
      <DashboardClient role={user.role} issueTypes={issueTypes} />
    </main>
  );
}
