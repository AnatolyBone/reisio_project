import crypto from "crypto";
import jwt from "jsonwebtoken";
import { json } from "./response.js";
import { getPrisma } from "./prisma.js";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const JWT_SECRET = process.env.JWT_SECRET;
const DEFAULT_ADMIN_ID = 2018254756;

export const verifyTelegramInitData = (initData) => {
  if (!initData || !BOT_TOKEN) {
    return { ok: false, error: "Missing initData or bot token" };
  }
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return { ok: false, error: "Missing hash" };

  params.delete("hash");
  const dataCheckString = [...params.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(BOT_TOKEN)
    .digest();

  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (computedHash !== hash) {
    return { ok: false, error: "Invalid hash" };
  }

  const userRaw = params.get("user");
  if (!userRaw) return { ok: false, error: "No user data" };
  const user = JSON.parse(userRaw);
  return { ok: true, user };
};

export const signToken = (payload) => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const requireAuth = async (event) => {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false, response: json(401, { error: "Unauthorized" }) };
  }
  try {
    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, JWT_SECRET);
    return { ok: true, userId: decoded.sub, isAdmin: decoded.isAdmin };
  } catch (err) {
    return { ok: false, response: json(401, { error: "Invalid token" }) };
  }
};

export const ensureAdminRole = async (userId) => {
  const prisma = getPrisma();
  if (userId === DEFAULT_ADMIN_ID) {
    await prisma.adminRole.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }
};
