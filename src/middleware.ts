import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count += 1;
  return true;
}

export default auth((req) => {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const path = req.nextUrl.pathname;
  
  if (path === "/login" || path === "/patient/login") {
    if (!rateLimit(`${ip}-login`, 5, 60 * 1000)) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
  }
  
  if (path.startsWith("/telemedicine/")) {
    if (!rateLimit(`${ip}-telemedicine`, 20, 60 * 1000)) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
  }

  if (path.startsWith("/api/")) {
    if (!rateLimit(`${ip}-api`, 100, 60 * 1000)) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
  }
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.png$).*)'],
};
