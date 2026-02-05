import { json, handleOptions } from "./_lib/response.js";
import { getPrisma } from "./_lib/prisma.js";
import { requireAuth } from "./_lib/auth.js";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return handleOptions();
  const auth = await requireAuth(event);
  if (!auth.ok) return auth.response;
  if (!auth.isAdmin) return json(403, { error: "Forbidden" });

  const prisma = getPrisma();
  const users = await prisma.user.findMany({
    orderBy: { lastLogin: "desc" },
    include: { plan: true },
  });
  return json(200, { users });
};
