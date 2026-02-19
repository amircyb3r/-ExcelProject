# سامانه Production-ready کال‌سنتر پشتیبانی فنی اینترنت

وب‌اپ مبتنی بر **Next.js + Prisma + PostgreSQL** برای ثبت لحظه‌ای فیدبک کارشناسان و مانیتورینگ سریع توسط سرشیفت.

## قابلیت‌ها
- احراز هویت بدون پسورد (Magic Link / OTP) با ایمیل و Rate Limit.
- نقش‌ها: `Agent` و `ShiftLead`.
- فرم داینامیک ثبت فیدبک بر اساس Issue Typeهای ویژه.
- داشبورد مشترک با آمار بازه‌ای، Top Issueها، Top شهرها، نمودارها، سهم FTTH/غیر FTTH و تحلیل AI (فقط گزارش).
- پنل سرشیفت: جدول مانیتورینگ زنده + فیلترهای کامل + خروجی CSV/Excel همگام با فیلترها.
- RTL کامل و رابط فارسی با تم سفید/آبی/نارنجی.
- Migration، Seed، Docker Compose، تست API-level (منطق اعتبارسنجی و فیلتر).

## پیش‌نیاز
- Node.js 20+
- PostgreSQL 16+

## نصب و اجرا (Local)
```bash
cp .env.example .env
npm install
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

آدرس: `http://localhost:3000`

## متغیرهای محیطی
| Key | توضیح |
|---|---|
| `DATABASE_URL` | اتصال PostgreSQL |
| `SESSION_SECRET` | کلید امن سشن |
| `NEXT_PUBLIC_APP_URL` | آدرس عمومی اپ |
| `ALLOWED_EMAIL_DOMAIN` | دامنه مجاز (مثلاً `@shatel.ir`) |
| `RESEND_API_KEY` | در صورت استفاده از Resend |
| `SMTP_*` | در صورت استفاده از SMTP |
| `OPENAI_API_KEY` | برای باکس تحلیل AI |

## مایگریشن و Seed
```bash
npx prisma migrate deploy
npm run prisma:seed
```

Seed شامل:
- سرشیفت پیش‌فرض: `a_aghazyarati@shatel.ir`
- لیست کامل Issue Typeها.

## تست
```bash
npm run test
```

## اجرای Docker
```bash
docker compose up --build
```

## Deploy
### VPS
1. ریپو را clone کنید.
2. `.env` واقعی را تنظیم کنید.
3. build و run:
```bash
npm ci
npx prisma migrate deploy
npm run prisma:seed
npm run build
npm run start
```
4. برای Production از reverse proxy (Nginx) و HTTPS استفاده کنید.

### PaaS
- سرویس web برای Next.js
- سرویس PostgreSQL مدیریت‌شده
- اجرای `prisma migrate deploy` در مرحله release

## امنیت و قابلیت اطمینان
- محافظت روت‌ها با middleware و بررسی سشن.
- کوکی HttpOnly + SameSite.
- محدودسازی ارسال لینک و verify.
- صفحه خطای فارسی.
- کش ۶۰ ثانیه‌ای برای تحلیل AI.

## ساختار کلیدی
- `app/api/*` : APIها
- `app/(dashboard)/dashboard` : پنل اصلی
- `prisma/*` : schema/migration/seed
- `tests/*` : تست‌ها
