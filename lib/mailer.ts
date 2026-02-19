import nodemailer from "nodemailer";
import { Resend } from "resend";
import { env } from "@/lib/env";

export async function sendAuthEmail(email: string, code: string, link: string) {
  if (env.resendKey) {
    const resend = new Resend(env.resendKey);
    await resend.emails.send({
      from: env.smtpFrom,
      to: email,
      subject: "ورود به سامانه کال‌سنتر",
      html: `<p>کد ورود: <b>${code}</b></p><p><a href="${link}">ورود با لینک</a></p>`
    });
    return;
  }
  if (env.smtpHost && env.smtpUser && env.smtpPass) {
    const transport = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: false,
      auth: { user: env.smtpUser, pass: env.smtpPass }
    });
    await transport.sendMail({
      from: env.smtpFrom,
      to: email,
      subject: "ورود به سامانه کال‌سنتر",
      html: `<p>کد ورود: <b>${code}</b></p><p><a href="${link}">ورود با لینک</a></p>`
    });
    return;
  }
  console.log(`MAGIC LOGIN ${email} code:${code} link:${link}`);
}
