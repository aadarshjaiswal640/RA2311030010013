import { api } from "../lib/api";
import { logger } from "../lib/logger";

export interface Notification {
  id: string;
  type: "Placement" | "Result" | "Event" | string;
  timestamp: string | number;
  message: string;
  content?: string;
  [key: string]: unknown;
}

export interface PriorityNotification extends Notification {
  priority: number;
  weight: number;
}

interface NotificationsResponse {
  notifications?: Notification[];
  data?: Notification[];
  [key: string]: unknown;
}

// Priority weights for notification types
const PRIORITY_WEIGHTS: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

/**
 * Get priority weight for notification type
 */
function getNotificationWeight(type: string): number {
  return PRIORITY_WEIGHTS[type] || 0;
}

/**
 * Parse timestamp to comparable format
 */
function parseTimestamp(timestamp: string | number): number {
  if (typeof timestamp === "number") return timestamp;
  const parsed = new Date(timestamp).getTime();
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Sort and prioritize notifications
 */
export function prioritizeNotifications(
  notifications: Notification[]
): {
  priorityNotifications: PriorityNotification[];
  allNotifications: PriorityNotification[];
} {
  try {
    // Add priority metadata to all notifications
    const withPriority: PriorityNotification[] = notifications.map((notif) => ({
      ...notif,
      weight: getNotificationWeight(notif.type),
      priority: 0, // Will be calculated after sorting
    }));

    // Sort by: 1) Weight (descending), 2) Timestamp (latest first)
    withPriority.sort((a, b) => {
      if (b.weight !== a.weight) {
        return b.weight - a.weight;
      }
      return parseTimestamp(b.timestamp) - parseTimestamp(a.timestamp);
    });

    // Add priority rank
    withPriority.forEach((notif, index) => {
      notif.priority = index + 1;
    });

    // Extract top 10 as priority notifications
    const priorityNotifications = withPriority.slice(0, 10);

    logger.info("hook", "Notifications prioritized", {
      total: withPriority.length,
      topPriority: priorityNotifications.length,
    });

    return {
      priorityNotifications,
      allNotifications: withPriority,
    };
  } catch (error) {
    logger.error("state", "Error prioritizing notifications", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      priorityNotifications: [],
      allNotifications: notifications.map((notif) => ({
        ...notif,
        weight: getNotificationWeight(notif.type),
        priority: 0,
      })),
    };
  }
}

/**
 * Fetch notifications from API
 */
export async function fetchNotifications(endpoint: string = "notifications"): Promise<Notification[]> {
  try {
    logger.info("api", "Fetching notifications", { endpoint });

    const response = await api.get<NotificationsResponse>(endpoint);

    // Handle different response formats
    const notifications: Notification[] =
      (response.notifications as Notification[]) ||
      (response.data as Notification[]) ||
      (Array.isArray(response) ? response : []);

    logger.info("api", "Notifications fetched successfully", {
      count: notifications.length,
    });

    return notifications;
  } catch (error) {
    // Treat 404 as "no data available" instead of error
    if (error instanceof Error && error.message.includes("404")) {
      logger.info("api", "Notifications endpoint not available (404)", { endpoint });
      return [];
    }

    logger.error("api", "Failed to fetch notifications", {
      error: error instanceof Error ? error.message : "Unknown error",
      endpoint,
    });
    throw error;
  }
}

/**
 * Format notification for display
 */
export function formatNotification(notif: PriorityNotification): {
  id: string;
  type: string;
  timestamp: string;
  message: string;
  priority: number;
} {
  const timestamp = new Date(parseTimestamp(notif.timestamp)).toLocaleString();
  return {
    id: notif.id || String(Math.random()),
    type: notif.type,
    timestamp,
    message: notif.message || notif.content || "No message",
    priority: notif.priority,
  };
}
