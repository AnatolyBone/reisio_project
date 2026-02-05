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
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { date: "asc" },
    });
    return json(200, { payments });
  }

  const body = event.body ? JSON.parse(event.body) : {};

  if (event.httpMethod === "POST") {
    const payment = await prisma.payment.create({
      data: {
        userId,
        date: new Date(body.date),
        type: body.type,
        amount: Number(body.amount),
        status: body.status,
        description: body.description,
      },
    });
    return json(200, { payment });
  }

  if (event.httpMethod === "PUT") {
    const payment = await prisma.payment.update({
      where: { id: body.id },
      data: {
        date: new Date(body.date),
        type: body.type,
        amount: Number(body.amount),
        status: body.status,
        description: body.description,
      },
    });
    return json(200, { payment });
  }

  if (event.httpMethod === "DELETE") {
    await prisma.payment.delete({ where: { id: body.id } });
    return json(200, { ok: true });
  }

  return json(405, { error: "Method not allowed" });
};
