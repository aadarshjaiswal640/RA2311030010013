import { logger } from "./logger";

const BASE_URL = "/api";

type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export interface RequestOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
  signal?: AbortSignal;
  query?: Record<string, string | number | boolean | null | undefined>;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly body: unknown | null;

  constructor(message: string, status: number, body: unknown | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function buildUrl(endpoint: string, query?: RequestOptions["query"]): string {
  const base = BASE_URL.replace(/\/$/, "");
  const path = endpoint.replace(/^\//, "");
  const url = `${base}/${path}`;

  if (!query) {
    return url;
  }

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) continue;
    params.set(key, String(value));
  }

  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
}

function getAuthorizationHeader(): string | undefined {
  const token = process.env.NEXT_PUBLIC_ACCESS_TOKEN;
  if (!token) {
    return undefined;
  }

  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
}

function normalizeBody(method: HttpMethod, body?: unknown): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (method === "GET" || method === "HEAD") {
    return undefined;
  }

  if (
    typeof body === "string" ||
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body)
  ) {
    return body;
  }

  return JSON.stringify(body);
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    return null as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}

async function sendWithTimeout<T>(
  endpoint: string,
  method: HttpMethod,
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  const controller = new AbortController();
  const { signal, timeoutMs = 10_000, headers = {}, query } = options;
  const url = buildUrl(endpoint, query);
  const requestBody = normalizeBody(method, body);
  const authHeader = getAuthorizationHeader();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  logger.debug("api", `${method} ${endpoint} request started`, { url });

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", () => controller.abort(), { once: true });
    }
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        ...(requestBody !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...headers,
      },
      body: requestBody,
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await parseResponse<unknown>(response);
      const errorMessage =
        errorBody && typeof errorBody === "object" && "message" in errorBody && typeof (errorBody as { message?: unknown }).message === "string"
          ? (errorBody as { message: string }).message
          : `HTTP ${response.status}: ${response.statusText}`;
      logger.warn("api", `${method} ${endpoint} failed`, { status: response.status, error: errorMessage });
      throw new ApiError(errorMessage, response.status, errorBody);
    }

    logger.info("api", `${method} ${endpoint} success`, { status: response.status });
    return await parseResponse<T>(response);
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      // Log 4xx errors as warn (they're often handled), 5xx as error
      const logLevel = error.status >= 400 && error.status < 500 ? "warn" : "error";
      logger[logLevel]("api", `${method} ${endpoint} failed`, { status: error.status, message: error.message });
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      logger.warn("api", `${method} ${endpoint} timeout after ${timeoutMs}ms`);
      throw new ApiError("Request timeout", 0, null);
    }

    const message = error instanceof Error ? error.message : "Unknown API error";
    logger.error("api", `${method} ${endpoint} exception`, { error: message });
    throw new ApiError(message, 0, null);
  } finally {
    clearTimeout(timeout);
  }
}

export async function sendRequest<T>(
  endpoint: string,
  method: HttpMethod = "GET",
  body?: unknown,
  options?: RequestOptions
): Promise<T> {
  return sendWithTimeout<T>(endpoint, method, body, options);
}

export const api = {
  request: sendRequest,
  get: <T>(endpoint: string, options?: RequestOptions) => sendRequest<T>(endpoint, "GET", undefined, options),
  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) => sendRequest<T>(endpoint, "POST", body, options),
  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) => sendRequest<T>(endpoint, "PUT", body, options),
  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) => sendRequest<T>(endpoint, "PATCH", body, options),
  delete: <T>(endpoint: string, body?: unknown, options?: RequestOptions) => sendRequest<T>(endpoint, "DELETE", body, options),
  head: <T>(endpoint: string, options?: RequestOptions) => sendRequest<T>(endpoint, "HEAD", undefined, options),
  options: <T>(endpoint: string, options?: RequestOptions) => sendRequest<T>(endpoint, "OPTIONS", undefined, options),
};