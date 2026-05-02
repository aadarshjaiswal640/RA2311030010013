import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "http://20.207.122.201/evaluation-service";

export const runtime = "nodejs";

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function handleRequest(req: NextRequest, method: string) {
  try {
    // Extract endpoint from URL (e.g., /api/proxy/auth -> auth)
    const url = new URL(req.url);
    const pathSegments = url.pathname.split("/").filter(Boolean);
    const endpoint = pathSegments.slice(2).join("/") || "auth"; // Default to /auth
    
    const body = ["GET", "HEAD"].includes(method) ? undefined : await req.json().catch(() => null);

    const res = await fetch(`${BASE_URL}/${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      ...(body && { body: JSON.stringify(body) }),
    });

    const data = await parseResponseBody(res);

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Proxy error",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleRequest(req, "GET");
}

export async function POST(req: NextRequest) {
  return handleRequest(req, "POST");
}

export async function PUT(req: NextRequest) {
  return handleRequest(req, "PUT");
}

export async function PATCH(req: NextRequest) {
  return handleRequest(req, "PATCH");
}

export async function DELETE(req: NextRequest) {
  return handleRequest(req, "DELETE");
}

export async function HEAD(req: NextRequest) {
  return handleRequest(req, "HEAD");
}