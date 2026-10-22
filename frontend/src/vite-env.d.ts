/// <reference types="vite/client" />

// The settings this app reads from frontend/.env (see .env.example).
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY?: string
  readonly VITE_FIREBASE_PROJECT_ID?: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string
  readonly VITE_FIREBASE_APP_ID?: string
  readonly VITE_FIREBASE_VAPID_KEY?: string
  readonly VITE_BACKEND_URL?: string
}
