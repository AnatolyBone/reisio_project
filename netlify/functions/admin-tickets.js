import { json, handleOptions } from "./_lib/response.js";
import { getPrisma } from "./_lib/prisma.js";
import { requireAuth } from "./_lib/auth.js";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return handleOptions();
  const auth = await requireAuth(event);
  if (!auth.ok) return auth.response;
  if (!auth.isAdmin) return json(403, { error: "Forbidden" });
  const prisma = getPrisma();

  if (event.httpMethod === "GET") {
    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });
    return json(200, { tickets });
  }

  if (event.httpMethod === "PATCH") {
    const body = event.body ? JSON.parse(event.body) : {};
    const ticket = await prisma.supportTicket.update({
      where: { id: body.id },
      data: {
        status: body.status,
        reply: body.reply || null,
        repliedAt: body.reply ? new Date() : undefined,
      },
    });
    if (body.reply && BOT_TOKEN) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: ticket.userId,
          text: `Ответ поддержки:\n${body.reply}`,
        }),
      });
    }
    return json(200, { ticket });
  }

  return json(405, { error: "Method not allowed" });
};
