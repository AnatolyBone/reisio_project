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
    const settings = await prisma.settings.findUnique({ where: { userId } });
    return json(200, { settings });
  }

  if (event.httpMethod === "PATCH") {
    const body = event.body ? JSON.parse(event.body) : {};
    const settings = await prisma.settings.upsert({
      where: { userId },
      update: {
        theme: body.theme,
        notifications: body.notifications,
        reportPeriod: body.reportPeriod,
      },
      create: {
        userId,
        theme: body.theme || "light",
        notifications: body.notifications ?? true,
        reportPeriod: body.reportPeriod || "monthly",
      },
    });
    return json(200, { settings });
  }

  return json(405, { error: "Method not allowed" });
};
