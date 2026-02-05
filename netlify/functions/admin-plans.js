import { json, handleOptions } from "./_lib/response.js";
import { getPrisma } from "./_lib/prisma.js";
import { requireAuth } from "./_lib/auth.js";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return handleOptions();
  const auth = await requireAuth(event);
  if (!auth.ok) return auth.response;
  if (!auth.isAdmin) return json(403, { error: "Forbidden" });
  const prisma = getPrisma();

  if (event.httpMethod === "PATCH") {
    const body = event.body ? JSON.parse(event.body) : {};
    const plan = await prisma.userPlan.upsert({
      where: { userId: Number(body.userId) },
      update: { plan: body.plan },
      create: { userId: Number(body.userId), plan: body.plan },
    });
    return json(200, { plan });
  }

  return json(405, { error: "Method not allowed" });
};
