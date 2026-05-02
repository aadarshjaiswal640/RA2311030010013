/**
 * Logging utility middleware
 * Calls external logging API: POST http://20.207.122.201/evaluation-service/logs
 */

type LogStack = "frontend";
type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";
type LogPackage = "api" | "component" | "hook" | "page" | "state" | "style";

interface LogPayload {
  stack: LogStack;
  level: LogLevel;
  package: LogPackage;
  message: string;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

const LOGGING_API = "http://20.207.122.201/evaluation-service/logs";

/**
 * Send log to external logging service
 */
async function sendLogToServer(payload: LogPayload): Promise<void> {
  try {
    const token = process.env.NEXT_PUBLIC_ACCESS_TOKEN;
    if (!token) {
      console.warn("[Logger] No access token available");
      return;
    }

    // Route through proxy with 'logs' endpoint
    const response = await fetch("/api/proxy/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...payload,
        timestamp: payload.timestamp || new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.warn(`[Logger] Failed to send log: ${response.status}`);
    }
  } catch (error) {
    console.warn("[Logger] Error sending log:", error);
  }
}

/**
 * Main logging function
 * @param stack - "frontend"
 * @param level - "debug" | "info" | "warn" | "error" | "fatal"
 * @param package - "api" | "component" | "hook" | "page" | "state" | "style"
 * @param message - Log message
 * @param metadata - Optional additional data
 */
export function Log(
  stack: LogStack,
  level: LogLevel,
  package_: LogPackage,
  message: string,
  metadata?: Record<string, unknown>
): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    stack,
    level,
    package: package_,
    message,
    timestamp,
    metadata,
  };

  // Console output for development - include metadata in message if present
  const consoleMethod = level === "error" || level === "fatal" ? "error" : level === "warn" ? "warn" : "log";
  const metadataStr = metadata && Object.keys(metadata).length > 0 ? ` ${JSON.stringify(metadata)}` : "";
  const fullMessage = `[${timestamp}] [${level.toUpperCase()}] [${package_}] ${message}${metadataStr}`;
  
  console[consoleMethod as "log" | "warn" | "error"](fullMessage);

  // Send to logging server
  sendLogToServer(logEntry);
}

/**
 * Convenience logging functions
 */
export const logger = {
  debug: (package_: LogPackage, message: string, metadata?: Record<string, unknown>) =>
    Log("frontend", "debug", package_, message, metadata),
  info: (package_: LogPackage, message: string, metadata?: Record<string, unknown>) =>
    Log("frontend", "info", package_, message, metadata),
  warn: (package_: LogPackage, message: string, metadata?: Record<string, unknown>) =>
    Log("frontend", "warn", package_, message, metadata),
  error: (package_: LogPackage, message: string, metadata?: Record<string, unknown>) =>
    Log("frontend", "error", package_, message, metadata),
  fatal: (package_: LogPackage, message: string, metadata?: Record<string, unknown>) =>
    Log("frontend", "fatal", package_, message, metadata),
};
