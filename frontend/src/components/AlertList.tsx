import { MAX_ALERTS, type TransferAlert } from '../alerts/transfer-alert'
import { t } from '../i18n/i18n'
import { AlertCard } from './AlertCard'

interface AlertListProps {
  alerts: TransferAlert[]
  connected: boolean
}

/** The alerts received while the page is open, newest first. */
export function AlertList({ alerts, connected }: AlertListProps) {
  return (
    <section className="alerts" aria-labelledby="alerts-title">
      <div className="alerts__header">
        <h2 id="alerts-title">{t.alertsTitle}</h2>
        <p className="alerts__count">
          {t.alertCount(alerts.length)}
          {alerts.length >= MAX_ALERTS && t.showingNewest(MAX_ALERTS)}
        </p>
      </div>

      {alerts.length === 0 ? (
        <p className="empty">{connected ? t.emptyConnected : t.emptyNotConnected}</p>
      ) : (
        <ol className="alerts__list">
          {alerts.map((alert) => (
            <li key={alert.id}>
              <AlertCard alert={alert} />
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
