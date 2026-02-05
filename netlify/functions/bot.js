import { Telegraf } from "telegraf";
import { json, handleOptions } from "./_lib/response.js";
import { getPrisma } from "./_lib/prisma.js";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL;
const ADMIN_TELEGRAM_ID = Number(process.env.ADMIN_TELEGRAM_ID || 2018254756);

const prisma = getPrisma();
const bot = new Telegraf(BOT_TOKEN || "");

const mainMenu = {
  reply_markup: {
    keyboard: [
      ["🚚 Новый рейс", "⛽ Расход"],
      ["🧮 Стоит ли брать груз?"],
      ["💰 Баланс", "⚙️ Профиль"],
      ["🆘 Поддержка"],
    ],
    resize_keyboard: true,
  },
};

const addMenu = {
  reply_markup: {
    keyboard: [
      ["🚚 Рейс", "⛽ Заправка"],
      ["💸 Платёж", "🧾 Расход"],
      ["⬅️ Назад"],
    ],
    resize_keyboard: true,
  },
};

const ensureUser = async (ctx) => {
  const user = ctx.from;
  const displayName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || `Пользователь ${user.id}`;
  const existing = await prisma.user.findUnique({ where: { id: user.id } });
  if (existing) return existing;
  return prisma.user.create({
    data: {
      id: user.id,
      firstName: user.first_name || "Пользователь",
      lastName: user.last_name,
      username: user.username,
      displayName,
      role: "Водитель",
    },
  });
};

const resetState = async (userId) => {
  await prisma.user.update({
    where: { id: userId },
    data: { botState: null, botDraftAmount: null, botDraftType: null, botDraftCost: null, botDraftDistance: null },
  });
};

bot.start(async (ctx) => {
  const user = await ensureUser(ctx);
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });
  const name = user.displayName || user.firstName;
  await ctx.reply(`Привет, ${name}!`, mainMenu);
});

bot.command("app", async (ctx) => {
  if (WEBAPP_URL) {
    return ctx.reply("Открыть приложение", {
      reply_markup: {
        keyboard: [[{ text: "Открыть приложение", web_app: { url: WEBAPP_URL } }]],
        resize_keyboard: true,
      },
    });
  }
  return ctx.reply("Ссылка на приложение не настроена.", mainMenu);
});

bot.command("добавить", async (ctx) => ctx.reply("Что добавить?", addMenu));
bot.hears("⬅️ Назад", async (ctx) => ctx.reply("Главное меню", mainMenu));

bot.hears("🚚 Новый рейс", async (ctx) => {
  const user = await ensureUser(ctx);
  await prisma.user.update({
    where: { id: user.id },
    data: { botState: "WAITING_ORDER_COST", botDraftCost: null, botDraftDistance: null },
  });
  return ctx.reply("Введите сумму рейса (₽)");
});

bot.hears("🚚 Рейс", async (ctx) => {
  const user = await ensureUser(ctx);
  await prisma.user.update({
    where: { id: user.id },
    data: { botState: "WAITING_ORDER_COST", botDraftCost: null, botDraftDistance: null },
  });
  return ctx.reply("Введите сумму рейса (₽)");
});

bot.hears("⛽ Расход", async (ctx) => {
  const user = await ensureUser(ctx);
  await prisma.user.update({
    where: { id: user.id },
    data: { botState: "WAITING_EXPENSE_AMOUNT", botDraftAmount: null, botDraftType: null },
  });
  return ctx.reply("Введите сумму расхода (₽)");
});

bot.hears("🧾 Расход", async (ctx) => {
  const user = await ensureUser(ctx);
  await prisma.user.update({
    where: { id: user.id },
    data: { botState: "WAITING_EXPENSE_AMOUNT", botDraftAmount: null, botDraftType: null },
  });
  return ctx.reply("Введите сумму расхода (₽)");
});

bot.hears("⛽ Заправка", async (ctx) => {
  const user = await ensureUser(ctx);
  await prisma.user.update({
    where: { id: user.id },
    data: { botState: "WAITING_FUEL_AMOUNT", botDraftAmount: null, botDraftType: "fuel" },
  });
  return ctx.reply("Введите сумму заправки (₽)");
});

bot.hears("💸 Платёж", async (ctx) => {
  const user = await ensureUser(ctx);
  await prisma.user.update({
    where: { id: user.id },
    data: { botState: "WAITING_PAYMENT_AMOUNT", botDraftAmount: null },
  });
  return ctx.reply("Введите сумму платежа (₽)");
});

bot.hears("💰 Баланс", async (ctx) => {
  const user = await ensureUser(ctx);
  const ordersSum = await prisma.order.aggregate({
    where: { userId: user.id },
    _sum: { cost: true },
  });
  const expenseSum = await prisma.expense.aggregate({
    where: { userId: user.id },
    _sum: { amount: true },
  });
  const profit = (ordersSum._sum.cost || 0) - (expenseSum._sum.amount || 0);
  const ближайшийПлатеж = await prisma.payment.findFirst({
    where: { userId: user.id, NOT: { status: "paid" } },
    orderBy: { date: "asc" },
  });
  const paymentText = ближайшийПлатеж
    ? `Ближайший платеж: ${new Date(ближайшийПлатеж.date).toLocaleDateString("ru-RU")} (${ближайшийПлатеж.amount} ₽)`
    : "Ближайших платежей нет";
  return ctx.reply(
    `Доход: ${(ordersSum._sum.cost || 0).toLocaleString("ru-RU")} ₽\nРасходы: ${(expenseSum._sum.amount || 0).toLocaleString("ru-RU")} ₽\nПрибыль: ${profit.toLocaleString("ru-RU")} ₽\n${paymentText}`,
    mainMenu
  );
});

bot.hears("⚙️ Профиль", async (ctx) => {
  const user = await ensureUser(ctx);
  const text = `Профиль: ${user.displayName}\nID: ${user.id}`;
  if (WEBAPP_URL) {
    return ctx.reply(text, {
      reply_markup: {
        keyboard: [[{ text: "Открыть приложение", web_app: { url: WEBAPP_URL } }]],
        resize_keyboard: true,
      },
    });
  }
  return ctx.reply(text, mainMenu);
});

bot.hears("🆘 Поддержка", async (ctx) => {
  const user = await ensureUser(ctx);
  await prisma.user.update({
    where: { id: user.id },
    data: { botState: "WAITING_SUPPORT_MESSAGE" },
  });
  return ctx.reply("Опишите проблему — мы передадим в поддержку.");
});

bot.hears("🧮 Стоит ли груз?", async (ctx) => {
  const user = await ensureUser(ctx);
  const vehicle = await prisma.vehicle.findFirst({ where: { userId: user.id } });
  if (!vehicle) {
    return ctx.reply(
      "Добавьте авто в приложении (раздел «Мои авто»): укажите расход и амортизацию — тогда смогу посчитать, выгоден ли груз.",
      mainMenu
    );
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { botState: "WAITING_CALC_RATE", botDraftCost: null, botDraftDistance: null },
  });
  return ctx.reply("Введите ставку за рейс (₽), например 50000");
});

function calcTrip(rate, distance, vehicle) {
  const fuelCost = (distance / 100) * vehicle.fuelConsumptionPer100 * vehicle.fuelPricePerLiter;
  const depreciation = (distance / 1000) * vehicle.depreciationPer1000;
  const foodParking = (distance / 1000) * vehicle.foodParkingPer1000;
  const totalCost = fuelCost + depreciation + foodParking;
  const net = rate - totalCost;
  const perKm = distance > 0 ? net / distance : 0;
  return {
    fuelCost: Math.round(fuelCost),
    depreciation: Math.round(depreciation),
    foodParking: Math.round(foodParking),
    totalCost: Math.round(totalCost),
    net: Math.round(net),
    perKm: Math.round(perKm * 10) / 10,
  };
}

bot.on("text", async (ctx) => {
  const user = await ensureUser(ctx);
  const input = ctx.message.text.trim();
  const state = user.botState;

  if (state === "WAITING_EXPENSE_AMOUNT") {
    const amount = Number(input.replace(/\s/g, ""));
    if (!amount) return ctx.reply("Введите сумму числом.");
    await prisma.user.update({
      where: { id: user.id },
      data: { botState: "WAITING_EXPENSE_CATEGORY", botDraftAmount: amount },
    });
    return ctx.reply("На что потратили?", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Топливо", callback_data: "expense_type:fuel" },
            { text: "Ремонт", callback_data: "expense_type:repair" },
            { text: "Прочее", callback_data: "expense_type:other" },
          ],
        ],
      },
    });
  }

  if (state === "WAITING_FUEL_AMOUNT") {
    const amount = Number(input.replace(/\s/g, ""));
    if (!amount) return ctx.reply("Введите сумму числом.");
    await prisma.expense.create({
      data: {
        userId: user.id,
        date: new Date(),
        type: "fuel",
        amount,
        description: "Заправка через бота",
      },
    });
    await resetState(user.id);
    return ctx.reply("Заправка сохранена.", mainMenu);
  }

  if (state === "WAITING_PAYMENT_AMOUNT") {
    const amount = Number(input.replace(/\s/g, ""));
    if (!amount) return ctx.reply("Введите сумму числом.");
    await prisma.user.update({
      where: { id: user.id },
      data: { botState: "WAITING_PAYMENT_TYPE", botDraftAmount: amount },
    });
    return ctx.reply("Тип платежа?", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Лизинг", callback_data: "payment_type:leasing" },
            { text: "Налог", callback_data: "payment_type:tax" },
            { text: "Ремонт", callback_data: "payment_type:repair" },
            { text: "Другое", callback_data: "payment_type:other" },
          ],
        ],
      },
    });
  }

  if (state === "WAITING_ORDER_COST") {
    const amount = Number(input.replace(/\s/g, ""));
    if (!amount) return ctx.reply("Введите сумму числом.");
    await prisma.user.update({
      where: { id: user.id },
      data: { botState: "WAITING_ORDER_DISTANCE", botDraftCost: amount },
    });
    return ctx.reply("Введите километраж рейса (км)");
  }

  if (state === "WAITING_ORDER_DISTANCE") {
    const distance = Number(input.replace(/\s/g, ""));
    if (!distance) return ctx.reply("Введите число (км).");
    const cost = user.botDraftCost || 0;
    await prisma.order.create({
      data: {
        userId: user.id,
        date: new Date(),
        client: "Telegram",
        route: "Рейс через бота",
        distance,
        cost,
        fuelExpense: 0,
        profit: cost,
      },
    });
    await resetState(user.id);
    return ctx.reply("Рейс сохранен.", mainMenu);
  }

  if (state === "WAITING_CALC_RATE") {
    const rate = Number(input.replace(/\s/g, ""));
    if (!rate || rate <= 0) return ctx.reply("Введите ставку числом (₽).");
    await prisma.user.update({
      where: { id: user.id },
      data: { botState: "WAITING_CALC_DISTANCE", botDraftCost: rate },
    });
    return ctx.reply("Введите расстояние (км), например 1000");
  }

  if (state === "WAITING_CALC_DISTANCE") {
    const distance = Number(input.replace(/\s/g, ""));
    if (!distance || distance <= 0) return ctx.reply("Введите расстояние числом (км).");
    const rate = user.botDraftCost || 0;
    const vehicle = await prisma.vehicle.findFirst({ where: { userId: user.id } });
    if (!vehicle) {
      await resetState(user.id);
      return ctx.reply("Авто не найдено. Добавьте в приложении раздел «Мои авто».", mainMenu);
    }
    const r = calcTrip(rate, distance, vehicle);
    const verdict = r.net > 0 ? "🟢 Выгодно" : "🔴 Невыгодно";
    const text =
      `Ставка: ${rate.toLocaleString("ru-RU")} ₽\n` +
      `Расстояние: ${distance} км\n\n` +
      `Топливо: −${r.fuelCost.toLocaleString("ru-RU")} ₽\n` +
      `Амортизация: −${r.depreciation.toLocaleString("ru-RU")} ₽\n` +
      `Еда/Стоянки: −${r.foodParking.toLocaleString("ru-RU")} ₽\n\n` +
      `Итого чистыми: ${r.net.toLocaleString("ru-RU")} ₽ (${r.perKm} ₽/км)\n\n` +
      `${verdict}`;
    await resetState(user.id);
    return ctx.reply(text, mainMenu);
  }

  if (state === "WAITING_SUPPORT_MESSAGE") {
    if (!input) return ctx.reply("Напишите сообщение.");
    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user.id,
        subject: "Поддержка (бот)",
        message: input,
      },
    });
    await resetState(user.id);
    const adminText = `Новый тикет от ${user.displayName || user.firstName} (ID ${user.id})\n${input}`;
    if (BOT_TOKEN && ADMIN_TELEGRAM_ID) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: ADMIN_TELEGRAM_ID, text: adminText }),
      });
    }
    return ctx.reply("Сообщение отправлено в поддержку. Спасибо!", mainMenu);
  }

  return ctx.reply("Используйте меню ниже.", mainMenu);
});

bot.action(/expense_type:(.+)/, async (ctx) => {
  const type = ctx.match[1];
  const userId = ctx.from.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.botDraftAmount) {
    await ctx.answerCbQuery();
    return ctx.reply("Сначала введите сумму.");
  }
  await prisma.expense.create({
    data: {
      userId,
      date: new Date(),
      type,
      amount: user.botDraftAmount,
      description: "Расход через бота",
    },
  });
  await resetState(userId);
  await ctx.answerCbQuery("Сохранено");
  return ctx.reply("Расход сохранен.", mainMenu);
});

bot.action(/payment_type:(.+)/, async (ctx) => {
  const type = ctx.match[1];
  const userId = ctx.from.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.botDraftAmount) {
    await ctx.answerCbQuery();
    return ctx.reply("Сначала введите сумму.");
  }
  await prisma.payment.create({
    data: {
      userId,
      date: new Date(),
      type,
      amount: user.botDraftAmount,
      status: "pending",
      description: "Платеж через бота",
    },
  });
  await resetState(userId);
  await ctx.answerCbQuery("Сохранено");
  return ctx.reply("Платеж сохранен.", mainMenu);
});

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return handleOptions();
  if (event.httpMethod !== "POST") {
    return json(200, { ok: true });
  }
  try {
    const update = JSON.parse(event.body);
    await bot.handleUpdate(update);
    return json(200, { ok: true });
  } catch (err) {
    return json(500, { error: "Bot error" });
  }
};
