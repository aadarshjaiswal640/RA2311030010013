import { api } from "../lib/api";
import { logger } from "../lib/logger";

export interface AuthRequest {
  email: string;
  name: string;
  rollNo: string;
  accessCode: string;
  clientID: string;
  clientSecret: string;
}

export interface AuthResponse {
  token_type: string;
  access_token: string;
  expires_in: number;
}

export interface DecodedToken {
  token_type?: string;
  access_token?: string;
  expires_in?: number;
  email?: string;
  name?: string;
  rollNo?: string;
  [key: string]: unknown;
}

/**
 * Authenticate user and retrieve access token
 */
export async function authenticate(payload: AuthRequest): Promise<AuthResponse> {
  try {
    logger.info("page", "Authentication started", {
      email: payload.email,
      clientID: payload.clientID,
    });

    const response = await api.post<AuthResponse>("proxy", payload);

    logger.info("page", "Authentication success", {
      email: payload.email,
      tokenType: response.token_type,
    });

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logger.error("page", "Authentication failed", {
      error: errorMessage,
      email: payload.email,
    });
    throw error;
  }
}

/**
 * Decode JWT token (client-side - basic extraction only)
 * Note: This does NOT verify the signature, only extracts the payload
 */
export function decodeToken(token: string): DecodedToken | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      logger.warn("api", "Invalid token format");
      return null;
    }

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    logger.debug("api", "Token decoded successfully");
    return decoded;
  } catch (error) {
    logger.error("api", "Failed to decode token", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return null;
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(expiresIn: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  return now > expiresIn;
}
