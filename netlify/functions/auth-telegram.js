import { json, handleOptions } from "./_lib/response.js";
import { getPrisma } from "./_lib/prisma.js";
import { verifyTelegramInitData, signToken, ensureAdminRole } from "./_lib/auth.js";

const allowManual = process.env.ALLOW_MANUAL_LOGIN === "true";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return handleOptions();
  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const prisma = getPrisma();
  const body = event.body ? JSON.parse(event.body) : {};

  if (body.manualId && allowManual) {
    const userId = Number(body.manualId);
    const firstName = body.name || "Пользователь";
    const displayName = body.name || "Пользователь";
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: { firstName, displayName, lastLogin: new Date() },
      create: {
        id: userId,
        firstName,
        displayName,
        role: "Водитель",
      },
    });
    await ensureAdminRole(userId);
    const isAdmin = !!(await prisma.adminRole.findUnique({ where: { userId } }));
    const token = signToken({ sub: userId, isAdmin });
    return json(200, { token, user, isAdmin });
  }

  const initData = body.initData;
  const result = verifyTelegramInitData(initData);
  if (!result.ok) {
    return json(401, { error: result.error });
  }

  const tgUser = result.user;
  const displayName = `${tgUser.first_name || ""} ${tgUser.last_name || ""}`.trim() || tgUser.username || `Пользователь ${tgUser.id}`;

  const user = await prisma.user.upsert({
    where: { id: tgUser.id },
    update: {
      firstName: tgUser.first_name || "Пользователь",
      lastName: tgUser.last_name,
      username: tgUser.username,
      photoUrl: tgUser.photo_url,
      displayName,
      lastLogin: new Date(),
    },
    create: {
      id: tgUser.id,
      firstName: tgUser.first_name || "Пользователь",
      lastName: tgUser.last_name,
      username: tgUser.username,
      photoUrl: tgUser.photo_url,
      displayName,
      role: "Водитель",
    },
  });

  await ensureAdminRole(tgUser.id);
  const isAdmin = !!(await prisma.adminRole.findUnique({ where: { userId: tgUser.id } }));
  const token = signToken({ sub: tgUser.id, isAdmin });

  return json(200, { token, user, isAdmin });
};
