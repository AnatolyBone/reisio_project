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
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return json(200, { user });
  }

  if (event.httpMethod === "PATCH") {
    const body = event.body ? JSON.parse(event.body) : {};
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName: body.displayName,
        role: body.role,
        company: body.company,
      },
    });
    return json(200, { user });
  }

  return json(405, { error: "Method not allowed" });
};
