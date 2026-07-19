export type ToastTone = 'apricot' | 'info' | 'success' | 'error'

type ToastProps = {
  tone?: ToastTone
  title: string
  body?: string
  actionLabel?: string
  onAction?: () => void
  dismissLabel?: string
  onDismiss?: () => void
}

/**
 * Shared toast — a white card that slides in above the pill. First consumer is
 * the permission-revoked notice (3.2); success / error / info variants exist
 * for future callers. The saved confirmation stays a status-pill, not a toast.
 */
export default function Toast({
  tone = 'info',
  title,
  body,
  actionLabel,
  onAction,
  dismissLabel = 'Dismiss',
  onDismiss
}: ToastProps) {
  return (
    <div className="toast glass-stroke">
      <div className="toast-head">
        <span className={`status-dot status-dot-${tone}`} />
        <span className="toast-title">{title}</span>
      </div>
      {body && <div className="toast-body">{body}</div>}
      {(actionLabel || onDismiss) && (
        <div className="toast-actions">
          {actionLabel && (
            <button className="toast-btn" onClick={onAction}>
              {actionLabel}
            </button>
          )}
          {onDismiss && (
            <button className="toast-dismiss" onClick={onDismiss}>
              {dismissLabel}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
