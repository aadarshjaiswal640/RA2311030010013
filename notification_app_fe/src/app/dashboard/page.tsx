"use client";

import React, { useEffect, useState } from "react";
import { authenticate, AuthRequest, AuthResponse, decodeToken, isTokenExpired } from "../../services/auth";
import { fetchNotifications, prioritizeNotifications, Notification, PriorityNotification } from "../../services/notifications";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { NotificationList } from "../../components/NotificationList";
import { logger } from "../../lib/logger";
import styles from "./dashboard.module.css";

interface DashboardState {
  authLoading: boolean;
  authError: string | null;
  authResponse: AuthResponse | null;
  notificationsLoading: boolean;
  notificationsError: string | null;
  allNotifications: PriorityNotification[];
  priorityNotifications: PriorityNotification[];
}

export default function Dashboard() {
  const [state, setState] = useState<DashboardState>({
    authLoading: false,
    authError: null,
    authResponse: null,
    notificationsLoading: false,
    notificationsError: null,
    allNotifications: [],
    priorityNotifications: [],
  });

  // Auto-authenticate on mount
  useEffect(() => {
    handleAuthenticate();
  }, []);

  const handleAuthenticate = async () => {
    try {
      setState((prev) => ({ ...prev, authLoading: true, authError: null }));

      const authPayload: AuthRequest = {
        email: "aj5076@srmist.edu.in",
        name: "aadarsh jaiswal",
        rollNo: "ra2311030010013",
        accessCode: "QkbpxH",
        clientID: "d23d1998-7572-4cac-a7a7-a63810a009c2",
        clientSecret: "GaKvcYvUWguNXHWF",
      };

      const response = await authenticate(authPayload);

      // Store token in sessionStorage (not localStorage for security)
      if (response.access_token) {
        sessionStorage.setItem("access_token", response.access_token);
        sessionStorage.setItem("token_expires_in", response.expires_in.toString());
      }

      setState((prev) => ({
        ...prev,
        authLoading: false,
        authResponse: response,
      }));

      logger.info("page", "Token stored successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Authentication failed";
      setState((prev) => ({
        ...prev,
        authLoading: false,
        authError: errorMessage,
      }));
      logger.error("page", "Authentication error", { error: errorMessage });
    }
  };

  const handleFetchNotifications = async () => {
    try {
      setState((prev) => ({ ...prev, notificationsLoading: true, notificationsError: null }));

      logger.info("page", "Fetching notifications triggered");

      const notifications = await fetchNotifications("notifications");

      if (notifications.length === 0) {
        logger.warn("page", "No notifications returned from API");
      }

      const { priorityNotifications, allNotifications } = prioritizeNotifications(notifications);

      setState((prev) => ({
        ...prev,
        notificationsLoading: false,
        allNotifications,
        priorityNotifications,
      }));

      logger.info("page", "Notifications loaded and prioritized", {
        total: allNotifications.length,
        priority: priorityNotifications.length,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch notifications";
      setState((prev) => ({
        ...prev,
        notificationsLoading: false,
        notificationsError: errorMessage,
      }));
      logger.error("page", "Notification fetch error", { error: errorMessage });
    }
  };

  const tokenInfo = state.authResponse?.access_token 
    ? decodeToken(state.authResponse.access_token) 
    : null;
  const isTokenValid = state.authResponse?.expires_in ? !isTokenExpired(state.authResponse.expires_in) : false;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>📊 Notification Dashboard</h1>
        <p className={styles.subtitle}>Manage and prioritize notifications</p>
      </header>

      <main className={styles.main}>
        {/* Authentication Section */}
        <section className={styles.section}>
          <h2>🔐 Authentication</h2>

          <div className={styles.buttonGroup}>
            <button
              className={styles.button}
              onClick={handleAuthenticate}
              disabled={state.authLoading}
            >
              {state.authLoading ? "Authenticating..." : "Authenticate"}
            </button>
          </div>

          {state.authError && (
            <ErrorState error={state.authError} onRetry={handleAuthenticate} />
          )}

          {state.authResponse && (
            <div className={styles.authSuccess}>
              <div className={styles.successIcon}>✓</div>
              <div className={styles.authDetails}>
                <p>
                  <strong>Status:</strong> <span className={styles.badge}>Authenticated</span>
                </p>
                <p>
                  <strong>Token Type:</strong> {state.authResponse.token_type}
                </p>
                <p>
                  <strong>Token Valid:</strong>{" "}
                  <span className={isTokenValid ? styles.valid : styles.invalid}>
                    {isTokenValid ? "✓ Yes" : "✗ Expired"}
                  </span>
                </p>
                {tokenInfo?.email && (
                  <p>
                    <strong>User:</strong> {tokenInfo.email}
                  </p>
                )}
                <details className={styles.tokenDetails}>
                  <summary>View Full Response</summary>
                  <pre>
                    {JSON.stringify(state.authResponse, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}
        </section>

        {/* Notifications Section */}
        <section className={styles.section}>
          <h2>📬 Notifications</h2>

          <div className={styles.buttonGroup}>
            <button
              className={styles.button}
              onClick={handleFetchNotifications}
              disabled={state.notificationsLoading || !state.authResponse}
              title={!state.authResponse ? "Please authenticate first" : ""}
            >
              {state.notificationsLoading ? "Loading..." : "Fetch Notifications"}
            </button>
          </div>

          {state.notificationsError && (
            <ErrorState
              error={state.notificationsError}
              onRetry={handleFetchNotifications}
            />
          )}

          {state.notificationsLoading && (
            <LoadingState message="Fetching notifications..." />
          )}

          {/* Priority Notifications */}
          {state.priorityNotifications.length > 0 && (
            <div className={styles.prioritySection}>
              <NotificationList
                notifications={state.priorityNotifications}
                title={`⭐ Top Priority Notifications (${state.priorityNotifications.length})`}
                maxHeight="400px"
              />
            </div>
          )}

          {/* All Notifications */}
          {state.allNotifications.length > 0 && (
            <div className={styles.allNotificationsSection}>
              <NotificationList
                notifications={state.allNotifications}
                title={`📋 All Notifications (${state.allNotifications.length})`}
                maxHeight="500px"
              />
            </div>
          )}

          {state.allNotifications.length === 0 && !state.notificationsLoading && !state.notificationsError && (
            <div className={styles.emptyPlaceholder}>
              <p>No notifications loaded yet. Click "Fetch Notifications" to load.</p>
            </div>
          )}
        </section>

        {/* Statistics */}
        {state.allNotifications.length > 0 && (
          <section className={styles.section}>
            <h2>📈 Statistics</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{state.allNotifications.length}</div>
                <div className={styles.statLabel}>Total Notifications</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{state.priorityNotifications.length}</div>
                <div className={styles.statLabel}>Top Priority (Top 10)</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>
                  {state.allNotifications.filter((n) => n.type === "Placement").length}
                </div>
                <div className={styles.statLabel}>Placement Notifications</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>
                  {state.allNotifications.filter((n) => n.type === "Result").length}
                </div>
                <div className={styles.statLabel}>Result Notifications</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>
                  {state.allNotifications.filter((n) => n.type === "Event").length}
                </div>
                <div className={styles.statLabel}>Event Notifications</div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className={styles.footer}>
        <p>© 2026 Notification System. All rights reserved.</p>
        <p className={styles.debug}>
          All actions are logged to: {/* */}
          <code>http://20.207.122.201/evaluation-service/logs</code>
        </p>
      </footer>
    </div>
  );
}
