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
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });
    return json(200, { orders });
  }

  const body = event.body ? JSON.parse(event.body) : {};

  if (event.httpMethod === "POST") {
    const order = await prisma.order.create({
      data: {
        userId,
        date: new Date(body.date),
        client: body.client,
        route: body.route,
        distance: Number(body.distance),
        cost: Number(body.cost),
        fuelExpense: Number(body.fuelExpense),
        profit: Number(body.profit),
      },
    });
    return json(200, { order });
  }

  if (event.httpMethod === "PUT") {
    const order = await prisma.order.update({
      where: { id: body.id },
      data: {
        date: new Date(body.date),
        client: body.client,
        route: body.route,
        distance: Number(body.distance),
        cost: Number(body.cost),
        fuelExpense: Number(body.fuelExpense),
        profit: Number(body.profit),
      },
    });
    return json(200, { order });
  }

  if (event.httpMethod === "DELETE") {
    await prisma.order.delete({ where: { id: body.id } });
    return json(200, { ok: true });
  }

  return json(405, { error: "Method not allowed" });
};
