import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { language, t } from './i18n/i18n'

// Tell the browser (and screen readers) which language the page is in.
document.documentElement.lang = language
document.title = t.title

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
