import { describe, expect, it } from 'vitest'
import { readConfig } from './config'

const VALID_ENV = {
  VITE_FIREBASE_API_KEY: 'AIzaTestKey',
  VITE_FIREBASE_PROJECT_ID: 'usdt-large-transfer-alert-test',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789012',
  VITE_FIREBASE_APP_ID: '1:123456789012:web:abc123',
  VITE_FIREBASE_VAPID_KEY: 'BTestVapidKey',
}

describe('readConfig', () => {
  it('reads every setting and uses the local backend by default', () => {
    expect(readConfig(VALID_ENV)).toEqual({
      firebase: {
        apiKey: 'AIzaTestKey',
        projectId: 'usdt-large-transfer-alert-test',
        messagingSenderId: '123456789012',
        appId: '1:123456789012:web:abc123',
      },
      vapidKey: 'BTestVapidKey',
      backendUrl: 'http://localhost:3000',
    })
  })

  it('uses VITE_BACKEND_URL without a trailing slash', () => {
    const env = { ...VALID_ENV, VITE_BACKEND_URL: 'https://api.example.com/' }
    expect(readConfig(env).backendUrl).toBe('https://api.example.com')
  })

  it('names every missing or placeholder setting in one error', () => {
    const env = { ...VALID_ENV, VITE_FIREBASE_APP_ID: '', VITE_FIREBASE_VAPID_KEY: 'YOUR_FIREBASE_VAPID_PUBLIC_KEY' }
    expect(() => readConfig(env)).toThrow(/VITE_FIREBASE_APP_ID, VITE_FIREBASE_VAPID_KEY/)
  })
})
