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
    const templates = await prisma.messageTemplate.findMany({ orderBy: { createdAt: "desc" } });
    return json(200, { templates });
  }

  const body = event.body ? JSON.parse(event.body) : {};

  if (event.httpMethod === "POST") {
    const template = await prisma.messageTemplate.create({
      data: { title: body.title, type: body.type, text: body.text },
    });
    return json(200, { template });
  }

  if (event.httpMethod === "PUT") {
    const template = await prisma.messageTemplate.update({
      where: { id: body.id },
      data: { title: body.title, type: body.type, text: body.text },
    });
    return json(200, { template });
  }

  if (event.httpMethod === "DELETE") {
    await prisma.messageTemplate.delete({ where: { id: body.id } });
    return json(200, { ok: true });
  }

  return json(405, { error: "Method not allowed" });
};
