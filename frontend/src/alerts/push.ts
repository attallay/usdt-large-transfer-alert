import { getApps, initializeApp } from 'firebase/app'
import { getMessaging, getToken, type Messaging } from 'firebase/messaging'
import { AppError } from '../config/app-error'
import type { AppConfig } from '../config/config'
import type { Language } from '../i18n/texts'

export { isSupported as isPushSupported } from 'firebase/messaging'

/** Type of the messages the service worker forwards to hidden app tabs. */
export const BACKGROUND_ALERT_MESSAGE = 'usdt-alert'

/**
 * Connects this browser to the alerts. Call it only after notification permission was granted.
 * Safe to call again: it then simply registers the same token once more.
 * 1. Registers the service worker that receives messages in the background.
 * 2. Gets this browser's FCM registration token (its "address" for push messages).
 * 3. Sends that token and the page's language to the backend, which sends every alert to it.
 */
export async function subscribeToAlerts(config: AppConfig, language: Language): Promise<Messaging> {
  const app = getApps()[0] ?? initializeApp(config.firebase)
  const messaging = getMessaging(app)

  let token: string
  try {
    // Files in public/ cannot read .env, so the service worker gets the Firebase settings in its URL.
    await navigator.serviceWorker.register(
      `/firebase-messaging-sw.js?${new URLSearchParams(config.firebase)}`,
    )
    const registration = await navigator.serviceWorker.ready
    token = await getToken(messaging, {
      vapidKey: config.vapidKey,
      serviceWorkerRegistration: registration,
    })
  } catch (error) {
    // Typical in browsers that turn off their push service, such as Brave by default.
    throw new AppError('push-registration-failed', describe(error))
  }

  let response: Response
  try {
    response = await fetch(`${config.backendUrl}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, language }),
    })
  } catch {
    throw new AppError('backend-unreachable', config.backendUrl)
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string } | null
    throw new AppError('backend-rejected', `HTTP ${response.status}: ${body?.message ?? '-'}`)
  }
  return messaging
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
