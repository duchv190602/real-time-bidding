import styles from './ErrorAlert.module.css';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Error alert component that shows the backend TraceID for debugging.
 * @param {{ message: string, traceId?: string, onDismiss?: () => void }} props
 */
export default function ErrorAlert({ message, traceId, onDismiss }) {
  if (!message) return null;

  return (
    <div className={styles.alert} role="alert" aria-live="assertive">
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <AlertTriangle size={15} />
          <span className={styles.title}>Đã xảy ra lỗi</span>
        </div>
        {onDismiss && (
          <button className={styles.dismiss} onClick={onDismiss} aria-label="Đóng thông báo lỗi">
            <X size={14} />
          </button>
        )}
      </div>
      <p className={styles.message}>{message}</p>
      {traceId && (
        <p className={styles.traceId}>
          <span className={styles.traceLabel}>Trace ID:</span> {traceId}
        </p>
      )}
    </div>
  );
}
