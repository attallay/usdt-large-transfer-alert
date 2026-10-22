import { AppError } from './app-error'

/** The app's settings, read from frontend/.env. */
export interface AppConfig {
  firebase: {
    apiKey: string
    projectId: string
    messagingSenderId: string
    appId: string
  }
  /** Public "Web Push certificate" key from the Firebase console. */
  vapidKey: string
  /** Address of the NestJS backend. */
  backendUrl: string
}

type EnvName =
  | 'VITE_FIREBASE_API_KEY'
  | 'VITE_FIREBASE_PROJECT_ID'
  | 'VITE_FIREBASE_MESSAGING_SENDER_ID'
  | 'VITE_FIREBASE_APP_ID'
  | 'VITE_FIREBASE_VAPID_KEY'
  | 'VITE_BACKEND_URL'

const DEFAULT_BACKEND_URL = 'http://localhost:3000'

/** Reads and checks the settings. Throws one error that names every missing value. */
export function readConfig(env: Partial<Record<EnvName, string>> = import.meta.env): AppConfig {
  const missing: string[] = []
  const required = (name: EnvName): string => {
    const value = env[name]?.trim() ?? ''
    if (value === '' || value.startsWith('YOUR_')) {
      missing.push(name)
    }
    return value
  }

  const config: AppConfig = {
    firebase: {
      apiKey: required('VITE_FIREBASE_API_KEY'),
      projectId: required('VITE_FIREBASE_PROJECT_ID'),
      messagingSenderId: required('VITE_FIREBASE_MESSAGING_SENDER_ID'),
      appId: required('VITE_FIREBASE_APP_ID'),
    },
    vapidKey: required('VITE_FIREBASE_VAPID_KEY'),
    backendUrl: (env.VITE_BACKEND_URL?.trim() || DEFAULT_BACKEND_URL).replace(/\/+$/, ''),
  }

  if (missing.length > 0) {
    throw new AppError('missing-config', missing.join(', '))
  }
  return config
}
