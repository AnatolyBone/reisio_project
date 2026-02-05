import { json, handleOptions } from "./_lib/response.js";
import { getPrisma } from "./_lib/prisma.js";
import { requireAuth } from "./_lib/auth.js";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_TELEGRAM_ID = Number(process.env.ADMIN_TELEGRAM_ID || 2018254756);

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return handleOptions();
  const auth = await requireAuth(event);
  if (!auth.ok) return auth.response;
  const userId = Number(auth.userId);
  const prisma = getPrisma();

  if (event.httpMethod === "POST") {
    const body = event.body ? JSON.parse(event.body) : {};
    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        subject: body.subject || "Поддержка",
        message: body.message || "",
      },
    });
    if (BOT_TOKEN && ADMIN_TELEGRAM_ID) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const adminText = `Новый тикет от ${user?.displayName || user?.firstName || "Пользователь"} (ID ${userId})\n${body.message || ""}`;
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: ADMIN_TELEGRAM_ID, text: adminText }),
      });
    }
    return json(200, { ticket });
  }

  return json(405, { error: "Method not allowed" });
};
