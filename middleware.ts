import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

const edgeLimiter = createRateLimiter("transcribe-edge", 20, 60_000);

export function middleware(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const limitState = edgeLimiter.check(ip);

  if (!limitState.allowed) {
    console.warn("Edge middleware limit hit", { ip, retryAfter: limitState.retryAfter });
    return NextResponse.json(
      {
        error: "rate_limit",
        retry_after: limitState.retryAfter,
        message: "Transcription service is busy — please try again in a few seconds."
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(limitState.retryAfter)
        }
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "microphone=(self)");
  return response;
}

export const config = {
  matcher: ["/api/transcribe"]
};
