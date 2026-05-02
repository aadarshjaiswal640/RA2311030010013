import React from "react";
import styles from "./ErrorState.module.css";

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
  <div className={styles.container}>
    <div className={styles.errorIcon}>⚠️</div>
    <h3 className={styles.title}>Error</h3>
    <p className={styles.message}>{error}</p>
    {onRetry && (
      <button className={styles.retryButton} onClick={onRetry}>
        Retry
      </button>
    )}
  </div>
);
