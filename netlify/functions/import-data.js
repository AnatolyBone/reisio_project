import { json, handleOptions } from "./_lib/response.js";
import { getPrisma } from "./_lib/prisma.js";
import { requireAuth } from "./_lib/auth.js";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return handleOptions();
  const auth = await requireAuth(event);
  if (!auth.ok) return auth.response;
  const userId = Number(auth.userId);
  const prisma = getPrisma();
  const body = event.body ? JSON.parse(event.body) : {};

  const { orders = [], expenses = [], payments = [], reminders = [] } = body;

  await prisma.$transaction([
    ...orders.map((order) =>
      prisma.order.upsert({
        where: { id: order.id },
        update: {
          date: new Date(order.date),
          client: order.client,
          route: order.route,
          distance: Number(order.distance),
          cost: Number(order.cost),
          fuelExpense: Number(order.fuelExpense),
          profit: Number(order.profit),
        },
        create: {
          id: order.id,
          userId,
          date: new Date(order.date),
          client: order.client,
          route: order.route,
          distance: Number(order.distance),
          cost: Number(order.cost),
          fuelExpense: Number(order.fuelExpense),
          profit: Number(order.profit),
        },
      })
    ),
    ...expenses.map((expense) =>
      prisma.expense.upsert({
        where: { id: expense.id },
        update: {
          date: new Date(expense.date),
          type: expense.type,
          amount: Number(expense.amount),
          description: expense.description,
          liters: expense.liters ? Number(expense.liters) : null,
          pricePerLiter: expense.pricePerLiter ? Number(expense.pricePerLiter) : null,
        },
        create: {
          id: expense.id,
          userId,
          date: new Date(expense.date),
          type: expense.type,
          amount: Number(expense.amount),
          description: expense.description,
          liters: expense.liters ? Number(expense.liters) : null,
          pricePerLiter: expense.pricePerLiter ? Number(expense.pricePerLiter) : null,
        },
      })
    ),
    ...payments.map((payment) =>
      prisma.payment.upsert({
        where: { id: payment.id },
        update: {
          date: new Date(payment.date),
          type: payment.type,
          amount: Number(payment.amount),
          status: payment.status,
          description: payment.description,
        },
        create: {
          id: payment.id,
          userId,
          date: new Date(payment.date),
          type: payment.type,
          amount: Number(payment.amount),
          status: payment.status,
          description: payment.description,
        },
      })
    ),
    ...reminders.map((reminder) =>
      prisma.reminder.upsert({
        where: { id: reminder.id },
        update: {
          title: reminder.title,
          type: reminder.type,
          dueDate: new Date(reminder.dueDate),
          amount: reminder.amount ? Number(reminder.amount) : null,
        },
        create: {
          id: reminder.id,
          userId,
          title: reminder.title,
          type: reminder.type,
          dueDate: new Date(reminder.dueDate),
          amount: reminder.amount ? Number(reminder.amount) : null,
        },
      })
    ),
  ]);

  return json(200, { ok: true });
};
