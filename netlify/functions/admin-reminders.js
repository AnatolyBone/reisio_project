import { json, handleOptions } from "./_lib/response.js";
import { getPrisma } from "./_lib/prisma.js";
import { requireAuth } from "./_lib/auth.js";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return handleOptions();
  const auth = await requireAuth(event);
  if (!auth.ok) return auth.response;
  if (!auth.isAdmin) return json(403, { error: "Forbidden" });
  const prisma = getPrisma();

  if (event.httpMethod === "GET") {
    const settings = await prisma.reminderSetting.findFirst();
    return json(200, { settings });
  }

  if (event.httpMethod === "PATCH") {
    const body = event.body ? JSON.parse(event.body) : {};
    const existing = await prisma.reminderSetting.findFirst();
    const settings = existing
      ? await prisma.reminderSetting.update({
          where: { id: existing.id },
          data: {
            enabled: body.enabled,
            daysBefore: Number(body.daysBefore),
          },
        })
      : await prisma.reminderSetting.create({
          data: {
            enabled: body.enabled ?? true,
            daysBefore: Number(body.daysBefore) || 3,
          },
        });
    return json(200, { settings });
  }

  return json(405, { error: "Method not allowed" });
};
