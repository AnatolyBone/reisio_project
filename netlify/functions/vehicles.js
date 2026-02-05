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
    const vehicles = await prisma.vehicle.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    return json(200, {
      vehicles: vehicles.map((v) => ({
        id: v.id,
        name: v.name,
        fuelConsumptionPer100: v.fuelConsumptionPer100,
        fuelPricePerLiter: v.fuelPricePerLiter,
        depreciationPer1000: v.depreciationPer1000,
        foodParkingPer1000: v.foodParkingPer1000,
      })),
    });
  }

  const body = event.body ? JSON.parse(event.body) : {};

  if (event.httpMethod === "POST") {
    const vehicle = await prisma.vehicle.create({
      data: {
        userId,
        name: body.name || "Авто",
        fuelConsumptionPer100: Number(body.fuelConsumptionPer100) || 32,
        fuelPricePerLiter: Number(body.fuelPricePerLiter) || 55,
        depreciationPer1000: Number(body.depreciationPer1000) || 5000,
        foodParkingPer1000: Number(body.foodParkingPer1000) ?? 2000,
      },
    });
    return json(200, {
      vehicle: {
        id: vehicle.id,
        name: vehicle.name,
        fuelConsumptionPer100: vehicle.fuelConsumptionPer100,
        fuelPricePerLiter: vehicle.fuelPricePerLiter,
        depreciationPer1000: vehicle.depreciationPer1000,
        foodParkingPer1000: vehicle.foodParkingPer1000,
      },
    });
  }

  if (event.httpMethod === "PUT") {
    const vehicle = await prisma.vehicle.update({
      where: { id: body.id },
      data: {
        name: body.name ?? undefined,
        fuelConsumptionPer100: body.fuelConsumptionPer100 != null ? Number(body.fuelConsumptionPer100) : undefined,
        fuelPricePerLiter: body.fuelPricePerLiter != null ? Number(body.fuelPricePerLiter) : undefined,
        depreciationPer1000: body.depreciationPer1000 != null ? Number(body.depreciationPer1000) : undefined,
        foodParkingPer1000: body.foodParkingPer1000 != null ? Number(body.foodParkingPer1000) : undefined,
      },
    });
    return json(200, {
      vehicle: {
        id: vehicle.id,
        name: vehicle.name,
        fuelConsumptionPer100: vehicle.fuelConsumptionPer100,
        fuelPricePerLiter: vehicle.fuelPricePerLiter,
        depreciationPer1000: vehicle.depreciationPer1000,
        foodParkingPer1000: vehicle.foodParkingPer1000,
      },
    });
  }

  if (event.httpMethod === "DELETE") {
    await prisma.vehicle.delete({ where: { id: body.id } });
    return json(200, { ok: true });
  }

  return json(405, { error: "Method not allowed" });
};
