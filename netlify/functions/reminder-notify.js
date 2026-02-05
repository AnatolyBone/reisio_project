import { getPrisma } from "./_lib/prisma.js";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const NOTIFY_MS = {
  at_time: 0,
  "1_hour": 60 * 60 * 1000,
  "1_day": 24 * 60 * 60 * 1000,
  "3_days": 3 * 24 * 60 * 60 * 1000,
  "1_week": 7 * 24 * 60 * 60 * 1000,
};

export const config = {
  schedule: "0 * * * *", // every hour (UTC)
};

export const handler = async () => {
  if (!BOT_TOKEN) {
    console.warn("TELEGRAM_BOT_TOKEN not set, skipping reminder notify");
    return { statusCode: 200, body: "ok" };
  }
  const prisma = getPrisma();
  const now = new Date();

  const reminders = await prisma.reminder.findMany({
    where: { reminderSentAt: null },
  });

  for (const r of reminders) {
    const due = new Date(r.dueDate);
    const notifyBeforeMs = NOTIFY_MS[r.notifyBefore] ?? NOTIFY_MS["1_day"];
    const notifyAt = new Date(due.getTime() - notifyBeforeMs);
    if (now >= notifyAt) {
      const amountStr = r.amount != null ? `\nСумма: ${Number(r.amount).toLocaleString("ru-RU")} ₽` : "";
      const text = `🔔 Напоминание: ${r.title}\nДата: ${due.toLocaleDateString("ru-RU")}${amountStr}`;
      try {
        const res = await fetch(
          `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: r.userId,
              text,
            }),
          }
        );
        if (res.ok) {
          await prisma.reminder.update({
            where: { id: r.id },
            data: { reminderSentAt: now },
          });
        }
      } catch (e) {
        console.error("reminder notify error", r.id, e);
      }
    }
  }

  return { statusCode: 200, body: "ok" };
};
