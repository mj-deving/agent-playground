import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";

export async function GET() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${BACKEND_URL}/health`, {
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.ok) {
      return NextResponse.json({
        status: "healthy",
        backend: "connected",
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(
      {
        status: "degraded",
        backend: `responded with ${response.status}`,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  } catch {
    return NextResponse.json(
      {
        status: "unhealthy",
        backend: "unreachable",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
