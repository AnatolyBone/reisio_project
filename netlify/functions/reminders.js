import { json, handleOptions } from "./_lib/response.js";
import { getPrisma } from "./_lib/prisma.js";
import { requireAuth } from "./_lib/auth.js";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return handleOptions();
  const auth = await requireAuth(event);
  if (!auth.ok) return auth.response;
  const userId = Number(auth.userId);
  const prisma = getPrisma();

  if (event.httpMethod === "GET") {
    const reminders = await prisma.reminder.findMany({
      where: { userId },
      orderBy: { dueDate: "asc" },
    });
    return json(200, {
      reminders: reminders.map((r) => ({
        id: r.id,
        type: r.type,
        title: r.title,
        dueDate: r.dueDate.toISOString().slice(0, 10),
        amount: r.amount,
        notifyBefore: r.notifyBefore || "1_day",
      })),
    });
  }

  const body = event.body ? JSON.parse(event.body) : {};

  if (event.httpMethod === "POST") {
    const reminder = await prisma.reminder.create({
      data: {
        userId,
        title: body.title,
        type: body.type,
        dueDate: new Date(body.dueDate),
        amount: body.amount ? Number(body.amount) : null,
        notifyBefore: body.notifyBefore || "1_day",
      },
    });
    return json(200, {
      reminder: {
        id: reminder.id,
        type: reminder.type,
        title: reminder.title,
        dueDate: reminder.dueDate.toISOString().slice(0, 10),
        amount: reminder.amount,
        notifyBefore: reminder.notifyBefore || "1_day",
      },
    });
  }

  if (event.httpMethod === "PUT") {
    const reminder = await prisma.reminder.update({
      where: { id: body.id },
      data: {
        title: body.title,
        type: body.type,
        dueDate: new Date(body.dueDate),
        amount: body.amount ? Number(body.amount) : null,
        notifyBefore: body.notifyBefore ?? undefined,
      },
    });
    return json(200, {
      reminder: {
        id: reminder.id,
        type: reminder.type,
        title: reminder.title,
        dueDate: reminder.dueDate.toISOString().slice(0, 10),
        amount: reminder.amount,
        notifyBefore: reminder.notifyBefore || "1_day",
      },
    });
  }

  if (event.httpMethod === "DELETE") {
    await prisma.reminder.delete({ where: { id: body.id } });
    return json(200, { ok: true });
  }

  return json(405, { error: "Method not allowed" });
};
