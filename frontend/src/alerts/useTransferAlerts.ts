import { onMessage, type Messaging } from 'firebase/messaging'
import { useCallback, useEffect, useState } from 'react'
import { AppError, type AppErrorCode } from '../config/app-error'
import { readConfig } from '../config/config'
import { language } from '../i18n/i18n'
import { BACKGROUND_ALERT_MESSAGE, isPushSupported, subscribeToAlerts } from './push'
import { addAlert, toTransferAlert, type TransferAlert } from './transfer-alert'

/** How often an open app registers again, so alerts resume soon after a backend restart. */
const REREGISTER_INTERVAL_MS = 60_000

export type AlertsStatus =
  | 'checking' // finding out what this browser supports
  | 'unsupported' // this browser cannot receive push messages
  | 'needs-permission' // waiting for the user to allow notifications
  | 'blocked' // the user blocked notifications for this site
  | 'connecting'
  | 'connected'
  | 'error'

/** What went wrong: a code the page explains in the user's language, plus technical detail. */
export interface AlertsError {
  code: AppErrorCode | 'unknown'
  detail: string
}

/** Connects to the alerts and collects every alert that arrives while the app is open. */
export function useTransferAlerts() {
  const [status, setStatus] = useState<AlertsStatus>('checking')
  const [error, setError] = useState<AlertsError | null>(null)
  const [alerts, setAlerts] = useState<TransferAlert[]>([])
  const [messaging, setMessaging] = useState<Messaging | null>(null)

  const connect = useCallback(async () => {
    setStatus('connecting')
    setError(null)
    try {
      const config = readConfig()
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'blocked' : 'needs-permission')
        return
      }
      setMessaging(await subscribeToAlerts(config, language))
      setStatus('connected')
    } catch (err) {
      setError(
        err instanceof AppError
          ? { code: err.code, detail: err.detail }
          : { code: 'unknown', detail: err instanceof Error ? err.message : String(err) },
      )
      setStatus('error')
    }
  }, [])

  // On page load: connect right away if notifications were already allowed earlier.
  useEffect(() => {
    let cancelled = false
    void isPushSupported()
      .catch(() => false)
      .then((supported) => {
        if (cancelled) return
        if (!supported) setStatus('unsupported')
        else if (Notification.permission === 'granted') void connect()
        else if (Notification.permission === 'denied') setStatus('blocked')
        else setStatus('needs-permission')
      })
    return () => {
      cancelled = true
    }
  }, [connect])

  // The backend keeps subscribed browsers in memory only, so register again every minute.
  useEffect(() => {
    if (status !== 'connected') return
    const timer = setInterval(() => {
      // A failed attempt (e.g. while the backend restarts) is simply retried next time.
      void subscribeToAlerts(readConfig(), language).catch(() => undefined)
    }, REREGISTER_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [status])

  // While connected, add every alert that reaches this tab, newest first.
  useEffect(() => {
    if (!messaging) return
    const receive = (data: Record<string, string> | undefined) => {
      const alert = toTransferAlert(data)
      if (alert) setAlerts((current) => addAlert(current, alert))
    }

    // Arrives here when this tab is visible.
    const stopListening = onMessage(messaging, (payload) => receive(payload.data))

    // When no app tab is visible, the service worker shows a system notification and
    // forwards the data, so a hidden tab's list stays complete too.
    const onWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === BACKGROUND_ALERT_MESSAGE) receive(event.data.data)
    }
    navigator.serviceWorker.addEventListener('message', onWorkerMessage)

    return () => {
      stopListening()
      navigator.serviceWorker.removeEventListener('message', onWorkerMessage)
    }
  }, [messaging])

  return { status, error, alerts, connect }
}
