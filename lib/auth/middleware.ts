import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth/jwt";

/**
 * Middleware to verify JWT token from Authorization header
 * Usage: Apply to protected API routes
 */
export function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix
  const payload = verifyJWT(token);

  if (!payload) {
    return null;
  }

  return payload;
}

/**
 * Wrapper for protected API routes
 * Automatically checks JWT and returns 401 if invalid
 */
export function withAdminAuth(
  handler: (request: NextRequest, payload: any) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const payload = verifyAdminToken(request);

    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - invalid or missing token" },
        { status: 401 }
      );
    }

    return handler(request, payload);
  };
}
