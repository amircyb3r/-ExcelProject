"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";

  const requestLink = async () => {
    const res = await fetch("/api/auth/request-link", { method: "POST", body: JSON.stringify({ email }) });
    const data = await res.json();
    setMsg(data.error ?? data.message);
  };

  const verify = async () => {
    const res = await fetch("/api/auth/verify", { method: "POST", body: JSON.stringify({ email, code, token, fullName: name }) });
    const data = await res.json();
    if (data.ok) router.push("/dashboard");
    else setMsg(data.error);
  };

  return (
    <main className="mx-auto mt-24 max-w-md rounded-xl bg-white p-6 shadow">
      <h1 className="mb-4 text-xl font-bold text-brand-blue">ورود بدون پسورد</h1>
      <div className="space-y-3">
        <Input placeholder="ایمیل" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button onClick={requestLink} type="button" className="w-full">ارسال لینک/کد</Button>
        <Input placeholder="کد ۶ رقمی" value={code} onChange={(e) => setCode(e.target.value)} />
        <Input placeholder="نام و نام خانوادگی (اولین ورود)" value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={verify} type="button" className="w-full bg-brand-orange">تایید و ورود</Button>
      </div>
      <p className="mt-4 text-sm text-slate-600">{msg}</p>
    </main>
  );
}
