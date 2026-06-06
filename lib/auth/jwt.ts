import jwt from "jsonwebtoken";

export interface AdminJWTPayload {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  iat?: number;
  exp?: number;
}

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-change-in-production";
const JWT_EXPIRY = "7d"; // 7 days

/**
 * Sign a JWT token for admin authentication
 */
export function signJWT(payload: Omit<AdminJWTPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
    algorithm: "HS256",
  });
}

/**
 * Verify a JWT token and return payload
 */
export function verifyJWT(token: string): AdminJWTPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });
    return payload as AdminJWTPayload;
  } catch (error) {
    console.error("JWT verification failed:", error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Decode JWT without verification (for inspection only)
 */
export function decodeJWT(token: string): AdminJWTPayload | null {
  try {
    const payload = jwt.decode(token);
    return payload as AdminJWTPayload;
  } catch (error) {
    return null;
  }
}
