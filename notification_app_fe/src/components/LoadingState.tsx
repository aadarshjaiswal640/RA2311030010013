import React from "react";
import styles from "./LoadingState.module.css";

export const LoadingState: React.FC<{ message?: string }> = ({ message = "Loading..." }) => (
  <div className={styles.container}>
    <div className={styles.spinner}></div>
    <p className={styles.message}>{message}</p>
  </div>
);
