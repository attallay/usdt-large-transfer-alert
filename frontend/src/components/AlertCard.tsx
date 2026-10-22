import type { TransferAlert } from '../alerts/transfer-alert'
import { t } from '../i18n/i18n'
import { etherscanAddressUrl, etherscanTxUrl, formatTime, formatUsdtAmount } from '../utils/format'

/** One large transfer: amount, time, and the full addresses and hash, each linked to Etherscan. */
export function AlertCard({ alert }: { alert: TransferAlert }) {
  return (
    <article className="alert">
      <header className="alert__header">
        <p className="alert__amount">
          {formatUsdtAmount(alert.amount, t.locale)} <span className="alert__unit">USDT</span>
        </p>
        <time className="alert__time" dateTime={alert.receivedAt.toISOString()}>
          {formatTime(alert.receivedAt, t.locale)}
        </time>
      </header>
      <dl className="alert__details">
        <div className="alert__row">
          <dt>{t.from}</dt>
          <dd>
            <EtherscanLink href={etherscanAddressUrl(alert.fromAddress)} text={alert.fromAddress} />
          </dd>
        </div>
        <div className="alert__row">
          <dt>{t.to}</dt>
          <dd>
            <EtherscanLink href={etherscanAddressUrl(alert.toAddress)} text={alert.toAddress} />
          </dd>
        </div>
        <div className="alert__row">
          <dt>{t.txHash}</dt>
          <dd>
            <EtherscanLink href={etherscanTxUrl(alert.txHash)} text={alert.txHash} />
          </dd>
        </div>
        <div className="alert__row">
          <dt>{t.block}</dt>
          <dd className="hash">{alert.blockNumber}</dd>
        </div>
      </dl>
    </article>
  )
}

function EtherscanLink({ href, text }: { href: string; text: string }) {
  return (
    <a className="hash" href={href} target="_blank" rel="noreferrer" title={t.openOnEtherscan}>
      {text}
    </a>
  )
}
