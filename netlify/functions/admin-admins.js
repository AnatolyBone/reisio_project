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
    const admins = await prisma.adminRole.findMany({ orderBy: { createdAt: "desc" } });
    return json(200, { admins });
  }

  const body = event.body ? JSON.parse(event.body) : {};

  if (event.httpMethod === "POST") {
    const admin = await prisma.adminRole.upsert({
      where: { userId: Number(body.userId) },
      update: {},
      create: { userId: Number(body.userId) },
    });
    return json(200, { admin });
  }

  if (event.httpMethod === "DELETE") {
    await prisma.adminRole.delete({ where: { userId: Number(body.userId) } });
    return json(200, { ok: true });
  }

  return json(405, { error: "Method not allowed" });
};
