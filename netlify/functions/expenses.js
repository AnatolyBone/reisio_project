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
    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });
    return json(200, { expenses });
  }

  const body = event.body ? JSON.parse(event.body) : {};

  if (event.httpMethod === "POST") {
    const expense = await prisma.expense.create({
      data: {
        userId,
        date: new Date(body.date),
        type: body.type,
        amount: Number(body.amount),
        description: body.description,
        liters: body.liters ? Number(body.liters) : null,
        pricePerLiter: body.pricePerLiter ? Number(body.pricePerLiter) : null,
      },
    });
    return json(200, { expense });
  }

  if (event.httpMethod === "PUT") {
    const expense = await prisma.expense.update({
      where: { id: body.id },
      data: {
        date: new Date(body.date),
        type: body.type,
        amount: Number(body.amount),
        description: body.description,
        liters: body.liters ? Number(body.liters) : null,
        pricePerLiter: body.pricePerLiter ? Number(body.pricePerLiter) : null,
      },
    });
    return json(200, { expense });
  }

  if (event.httpMethod === "DELETE") {
    await prisma.expense.delete({ where: { id: body.id } });
    return json(200, { ok: true });
  }

  return json(405, { error: "Method not allowed" });
};
