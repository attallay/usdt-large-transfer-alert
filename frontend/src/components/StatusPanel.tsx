import type { AlertsError, AlertsStatus } from '../alerts/useTransferAlerts'
import { t } from '../i18n/i18n'

type Tone = 'info' | 'ok' | 'warn' | 'error'

const TONES: Record<AlertsStatus, Tone> = {
  checking: 'info',
  connecting: 'info',
  connected: 'ok',
  'needs-permission': 'warn',
  blocked: 'error',
  unsupported: 'error',
  error: 'error',
}

interface StatusPanelProps {
  status: AlertsStatus
  error: AlertsError | null
  onConnect: () => void
}

/** Shows the connection state and, when needed, the button that connects this browser. */
export function StatusPanel({ status, error, onConnect }: StatusPanelProps) {
  const { title, detail } = t.status[status]

  return (
    <section className={`status status--${TONES[status]}`} role="status" aria-live="polite">
      <span className="status__dot" aria-hidden="true" />
      <div className="status__text">
        <p className="status__title">{title}</p>
        {detail && <p className="status__detail">{detail}</p>}
        {status === 'error' && error && (
          <>
            <p className="status__detail">{t.errors[error.code]}</p>
            <p className="status__error">{error.detail}</p>
          </>
        )}
      </div>
      {status === 'needs-permission' && (
        <button type="button" className="button" onClick={onConnect}>
          {t.enableNotifications}
        </button>
      )}
      {status === 'error' && (
        <button type="button" className="button" onClick={onConnect}>
          {t.tryAgain}
        </button>
      )}
    </section>
  )
}
