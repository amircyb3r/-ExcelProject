import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

const ISSUE_TYPES = [
  "config یا ONT مودم",
  "FixPhone",
  "اسکای فایبریا شاتل موبایل افت سرعت",
  "اسکای فایبریا شاتل موبایل no page",
  "PTP",
  "ShatelTalk",
  "upgrade مودم",
  "آماده نصب",
  "اتمام ترافیک سرویس اینترنت",
  "افت سرعت FTTH",
  "افت سرعت مشکل داخلی",
  "اینترنت مشترک قطع است (Error678)",
  "اینترنت مشترک قطع است (Error691)",
  "بررسی تجهیزات",
  "مشکل با بوق خط",
  "Wireless مشکلات",
  "جابجایی پورت",
  "چراغ GPON چشمک زن",
  "چراغ GPON خاموش یا قرمز",
  "چراغ Internet خاموش (FTTH)",
  "چراغ Status مودم خاموش است مشکل داخلی",
  "سوال فنی داشتند",
  "سوال فنی در مورد پارامترهای خط",
  "سوال فنی (آیا connect هستند)",
  "عدم ارسال ایمیل از طریق Outlook",
  "عدم باز شدن سایتی خاص",
  "قطع به علت مشکل خارج از شبکه شاتل",
  "قطع به علت مشکل در دیتای شاتل",
  "قطع تی پی تی پی",
  "قطع شدن پی در پی (قطع pppoe)",
  "قطع شدن پی در پی (قطع status)",
  "قطعی پی در پی FTTH",
  "مشکل Power در ONT",
  "مشکل از مرورگر",
  "مشکل با Static IP",
  "مشکل با بازی آنلاین",
  "مشکل با ترافیک مصرفی",
  "مشکل با مسنجرها و شبکه های اجتماعی داخلی",
  "مشکل با نویز و سیگنال",
  "مشکل فنی با CGNAT",
  "مشکل فنی با My Shatel",
  "مشکل فنی با نماوا",
  "مشکل با فیلتر شکن ها",
  "مشکل مالی سوال مربوط به فروش",
  "مشکل وایرلس FTTH",
  "مشکلات شبکه داخلی",
  "مشکلات نرم افزاری از سمت شاتل"
];

async function main() {
  await prisma.user.upsert({
    where: { email: "a_aghazyarati@shatel.ir" },
    create: {
      email: "a_aghazyarati@shatel.ir",
      fullName: "سرشیفت پیش‌فرض",
      role: Role.SHIFT_LEAD
    },
    update: { role: Role.SHIFT_LEAD }
  });

  for (const title of ISSUE_TYPES) {
    await prisma.issueType.upsert({
      where: { title },
      create: { title },
      update: {}
    });
  }
}

main().finally(() => prisma.$disconnect());
