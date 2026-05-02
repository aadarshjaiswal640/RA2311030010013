import React from "react";
import { PriorityNotification } from "../services/notifications";
import styles from "./NotificationList.module.css";

interface NotificationListProps {
  notifications: PriorityNotification[];
  title?: string;
  maxHeight?: string;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  title = "All Notifications",
  maxHeight = "600px",
}) => {
  if (notifications.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No notifications available</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {title && <h2 className={styles.title}>{title}</h2>}
      <div className={styles.listContainer} style={{ maxHeight }}>
        {notifications.map((notification) => (
          <div key={notification.id || Math.random()} className={styles.notificationCard}>
            <div className={styles.header}>
              <div className={styles.typeAndPriority}>
                <span className={`${styles.type} ${styles[`type-${notification.type}`]}`}>
                  {notification.type}
                </span>
                {notification.priority && (
                  <span className={styles.priority}>#{notification.priority}</span>
                )}
              </div>
              <span className={styles.timestamp}>
                {new Date(
                  typeof notification.timestamp === "string"
                    ? notification.timestamp
                    : notification.timestamp * 1000
                ).toLocaleString()}
              </span>
            </div>
            <div className={styles.content}>
              <p>{notification.message || notification.content || "No content"}</p>
            </div>
            {notification.weight !== undefined && (
              <div className={styles.metadata}>
                <span>Weight: {notification.weight}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
