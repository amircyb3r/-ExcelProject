"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { IRAN_CITIES, SPECIAL_ISSUES } from "@/lib/constants";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

type Props = {
  role: "SHIFT_LEAD" | "AGENT";
  issueTypes: { id: string; title: string }[];
};

type Filters = {
  from: string;
  to: string;
  issueType: string;
  city: string;
  createdBy: string;
  q: string;
};

const FTTH_KEYWORDS = ["FTTH", "ONT", "GPON"];

export function DashboardClient({ role, issueTypes }: Props) {
  const [stats, setStats] = useState<any>(null);
  const [mon, setMon] = useState<any>({ rows: [], users: [] });
  const [ai, setAi] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [error, setError] = useState("");
  const firstInput = useRef<HTMLInputElement>(null);

  const now = new Date();
  const defaultFrom = new Date(now.getTime() - 24 * 3600 * 1000).toISOString().slice(0, 16);
  const defaultTo = now.toISOString().slice(0, 16);

  const [filters, setFilters] = useState<Filters>({ from: defaultFrom, to: defaultTo, issueType: "", city: "", createdBy: "", q: "" });
  const [form, setForm] = useState<any>({ issueTypeId: "", issueTypeTitle: "", city: "" });
  const special = useMemo(() => SPECIAL_ISSUES.includes(form.issueTypeTitle), [form.issueTypeTitle]);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (filters.from) p.set("from", new Date(filters.from).toISOString());
    if (filters.to) p.set("to", new Date(filters.to).toISOString());
    if (filters.issueType) p.set("issueType", filters.issueType);
    if (filters.city) p.set("city", filters.city);
    if (filters.createdBy) p.set("createdBy", filters.createdBy);
    if (filters.q) p.set("q", filters.q);
    return p.toString();
  }, [filters]);

  const load = async () => {
    try {
      setError("");
      const [s, m, a] = await Promise.all([
        fetch("/api/dashboard").then((r) => r.json()),
        fetch(`/api/monitoring?${query}`).then((r) => r.json()),
        fetch(`/api/ai-analysis?${query}`).then((r) => r.json())
      ]);
      setStats(s);
      setMon(m);
      setAi(a.analysis ?? "");
    } catch {
      setError("خطا در دریافت داده‌ها");
    }
  };

  useEffect(() => {
    load();
  }, [query]);

  useEffect(() => {
    if (!autoRefresh || role !== "SHIFT_LEAD") return;
    const i = setInterval(load, 10_000);
    return () => clearInterval(i);
  }, [autoRefresh, role, query]);

  const submit = async () => {
    const res = await fetch("/api/feedbacks", { method: "POST", body: JSON.stringify(form) });
    const data = await res.json();
    if (!data.ok) return alert(data.error);
    setForm({ issueTypeId: "", issueTypeTitle: "", city: "" });
    firstInput.current?.focus();
    load();
  };

  const topIssuesFromRows = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of mon.rows ?? []) counts.set(row.issueType.title, (counts.get(row.issueType.title) ?? 0) + 1);
    return [...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [mon.rows]);

  const topCitiesFromRows = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of mon.rows ?? []) counts.set(row.city, (counts.get(row.city) ?? 0) + 1);
    return [...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);
  }, [mon.rows]);

  const ftthShare = useMemo(() => {
    let ftth = 0;
    let nonFtth = 0;
    for (const row of mon.rows ?? []) {
      if (FTTH_KEYWORDS.some((k) => row.issueType.title.includes(k))) ftth += 1;
      else nonFtth += 1;
    }
    return [
      { name: "FTTH", value: ftth },
      { name: "غیر FTTH", value: nonFtth }
    ];
  }, [mon.rows]);

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white p-4 shadow">
        <h2 className="mb-4 text-lg font-bold text-brand-blue">ثبت فیدبک سریع</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Select value={form.issueTypeId} onChange={(e) => {
            const item = issueTypes.find((i) => i.id === e.target.value);
            setForm({ ...form, issueTypeId: e.target.value, issueTypeTitle: item?.title ?? "" });
          }}>
            <option value="">نوع مشکل</option>
            {issueTypes.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
          </Select>
          <Select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
            <option value="">شهر</option>
            {IRAN_CITIES.map((x) => <option key={x}>{x}</option>)}
          </Select>
          {special ? (
            <>
              <Input ref={firstInput} placeholder="شماره سیمکارت" value={form.simCardNumber ?? ""} onChange={(e) => setForm({ ...form, simCardNumber: e.target.value })} />
              <Input placeholder="اپراتور متصل" value={form.connectedOperator ?? ""} onChange={(e) => setForm({ ...form, connectedOperator: e.target.value })} />
              <Input placeholder="شهر و منطقه" value={form.area ?? ""} onChange={(e) => setForm({ ...form, area: e.target.value })} />
            </>
          ) : (
            <>
              <Input ref={firstInput} placeholder="شناسه مشترک" value={form.customerId ?? ""} onChange={(e) => setForm({ ...form, customerId: e.target.value })} />
              <Input placeholder="IP مشترک" value={form.customerIp ?? ""} onChange={(e) => setForm({ ...form, customerIp: e.target.value })} />
              <Input placeholder="نام مرکز" value={form.centerName ?? ""} onChange={(e) => setForm({ ...form, centerName: e.target.value })} />
            </>
          )}
          <Input className="md:col-span-2" placeholder="توضیحات اختیاری" value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <Button onClick={submit} className="mt-4">ثبت و آماده مورد بعدی</Button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[{ t: "امروز", v: stats?.today ?? 0 }, { t: "۱ ساعت اخیر", v: stats?.lastHour ?? 0 }, { t: "۱۰ دقیقه اخیر", v: stats?.last10 ?? 0 }].map((card) => (
          <div key={card.t} className="rounded-xl bg-white p-4 shadow"><p className="text-sm text-slate-500">{card.t}</p><p className="text-2xl font-bold">{card.v}</p></div>
        ))}
      </section>

      <section className="rounded-xl bg-white p-4 shadow">
        <h3 className="mb-2 font-bold text-brand-orange">تحلیل AI (فقط گزارش)</h3>
        <p className="text-sm leading-7">{ai || "در حال بارگذاری..."}</p>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="h-72 rounded-xl bg-white p-4 shadow">
          <h3 className="mb-2 font-semibold">Top issueType (فیلترشده)</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={topIssuesFromRows}><XAxis dataKey="name" hide /><YAxis /><Tooltip /><Bar dataKey="count" fill="#2f5bea" /></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-72 rounded-xl bg-white p-4 shadow">
          <h3 className="mb-2 font-semibold">Top شهرها (فیلترشده)</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={topCitiesFromRows}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#ff8a00" /></BarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-72 rounded-xl bg-white p-4 shadow">
          <h3 className="mb-2 font-semibold">سهم FTTH / غیر FTTH</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={ftthShare} dataKey="value" nameKey="name" outerRadius={90}>
                <Cell fill="#2f5bea" />
                <Cell fill="#ff8a00" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {role === "SHIFT_LEAD" && (
        <section className="rounded-xl bg-white p-4 shadow">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-bold">مانیتورینگ لحظه‌ای</h3>
            <label className="text-sm"><input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} /> Auto-refresh</label>
          </div>

          <div className="mb-3 grid gap-2 md:grid-cols-3">
            <Input type="datetime-local" value={filters.from} onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))} />
            <Input type="datetime-local" value={filters.to} onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))} />
            <Input placeholder="جستجو customerId / IP / توضیحات" value={filters.q} onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))} />
            <Select value={filters.issueType} onChange={(e) => setFilters((p) => ({ ...p, issueType: e.target.value }))}>
              <option value="">همه issueTypeها</option>
              {issueTypes.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
            </Select>
            <Select value={filters.city} onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))}>
              <option value="">همه شهرها</option>
              {IRAN_CITIES.map((x) => <option key={x}>{x}</option>)}
            </Select>
            <Select value={filters.createdBy} onChange={(e) => setFilters((p) => ({ ...p, createdBy: e.target.value }))}>
              <option value="">همه کارشناسان</option>
              {(mon.users ?? []).map((u: any) => <option key={u.id} value={u.id}>{u.fullName ?? u.email}</option>)}
            </Select>
          </div>

          <div className="mb-3 flex gap-2">
            <a className="rounded bg-brand-blue px-3 py-2 text-sm text-white" href={`/api/export/csv?${query}`}>خروجی CSV</a>
            <a className="rounded bg-brand-orange px-3 py-2 text-sm text-white" href={`/api/export/excel?${query}`}>خروجی Excel</a>
          </div>

          <div className="max-h-80 overflow-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-right text-slate-500"><th>زمان</th><th>نوع</th><th>شهر</th><th>شناسه/IP</th><th>کارشناس</th></tr></thead>
              <tbody>
                {(mon.rows ?? []).map((r: any) => (
                  <tr key={r.id} className="border-t"><td>{new Date(r.createdAt).toLocaleString("fa-IR")}</td><td>{r.issueType.title}</td><td>{r.city}</td><td>{r.customerId ?? r.simCardNumber} / {r.customerIp ?? r.connectedOperator}</td><td>{r.createdBy.fullName ?? r.createdBy.email}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
