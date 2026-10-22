// Service worker: a script the browser keeps running in the background, even when no tab of this
// app is visible. It receives the push messages from Firebase Cloud Messaging.
//
// Files in public/ are served as they are and cannot read frontend/.env, so the app passes the
// Firebase settings in this script's URL (see src/push.ts). The version below must match the
// "firebase" version in package.json.
importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js')

const settings = new URL(self.location.href).searchParams

firebase.initializeApp({
  apiKey: settings.get('apiKey'),
  projectId: settings.get('projectId'),
  messagingSenderId: settings.get('messagingSenderId'),
  appId: settings.get('appId'),
})

const messaging = firebase.messaging()

// When no app tab is visible, the Firebase SDK above shows the message's notification by itself.
// Also forward the data to any open (hidden) app tabs so their alert list stays complete.
messaging.onBackgroundMessage(async (payload) => {
  const tabs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
  for (const tab of tabs) {
    tab.postMessage({ type: 'usdt-alert', data: payload.data })
  }
})
