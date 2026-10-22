import { useTransferAlerts } from './alerts/useTransferAlerts'
import { AlertList } from './components/AlertList'
import { StatusPanel } from './components/StatusPanel'
import { t } from './i18n/i18n'
import { etherscanAddressUrl } from './utils/format'

const USDT_CONTRACT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

function App() {
  const { status, error, alerts, connect } = useTransferAlerts()

  return (
    <main className="page">
      <header className="page-header">
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
      </header>

      <StatusPanel status={status} error={error} onConnect={() => void connect()} />

      <AlertList alerts={alerts} connected={status === 'connected'} />

      <footer className="page-footer">
        {t.footerBeforeContract}
        <a className="hash" href={etherscanAddressUrl(USDT_CONTRACT)} target="_blank" rel="noreferrer">
          {USDT_CONTRACT}
        </a>
        {t.footerAfterContract}
      </footer>
    </main>
  )
}

export default App
