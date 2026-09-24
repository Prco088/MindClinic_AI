import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const status = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      database: "UNKNOWN",
      ai: "UNKNOWN",
      storage: "UNKNOWN",
      livekit: "UNKNOWN",
    },
  };

  try {
    // 1. Database Check
    await prisma.$queryRaw`SELECT 1`;
    status.services.database = "OK";
  } catch (error) {
    status.services.database = "ERROR";
  }

  // 2. AI Check (Verifica se a chave da API está configurada)
  if (process.env.GEMINI_API_KEY) {
    status.services.ai = "OK";
  } else {
    status.services.ai = "MISSING_KEY";
  }

  // 3. Storage Check (S3 / R2 Keys)
  if (process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY && process.env.S3_ENDPOINT) {
    status.services.storage = "OK";
  } else {
    status.services.storage = "MISSING_KEY";
  }

  // 4. LiveKit Check
  if (process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET && process.env.NEXT_PUBLIC_LIVEKIT_URL) {
    status.services.livekit = "OK";
  } else {
    status.services.livekit = "MISSING_KEY";
  }

  const isHealthy = Object.values(status.services).every((s) => s === "OK" || s === "MISSING_KEY");

  return NextResponse.json(status, { status: isHealthy ? 200 : 503 });
}
