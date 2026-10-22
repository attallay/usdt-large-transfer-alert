import type { AlertsStatus } from '../alerts/useTransferAlerts'
import type { AppErrorCode } from '../config/app-error'

export type Language = 'tr' | 'en'

/** Every text on the page. Each language must provide all of them (TypeScript checks this). */
export interface Texts {
  /** Used to format numbers and times, e.g. "4.000.000,00" in Turkish. */
  locale: string
  title: string
  subtitle: string
  status: Record<AlertsStatus, { title: string; detail?: string }>
  enableNotifications: string
  tryAgain: string
  errors: Record<AppErrorCode | 'unknown', string>
  alertsTitle: string
  alertCount: (count: number) => string
  showingNewest: (max: number) => string
  emptyConnected: string
  emptyNotConnected: string
  from: string
  to: string
  txHash: string
  block: string
  openOnEtherscan: string
  footerBeforeContract: string
  footerAfterContract: string
}

export const TEXTS: Record<Language, Texts> = {
  tr: {
    locale: 'tr-TR',
    title: 'USDT Büyük Transfer Alarmı',
    subtitle: 'Ethereum ağında 100.000 USDT ve üzeri her transfer burada anında görünür.',
    status: {
      checking: { title: 'Tarayıcı kontrol ediliyor…' },
      connecting: {
        title: 'Bağlanılıyor…',
        detail: 'Tarayıcınız bildirim izni isterse "İzin ver"i seçin.',
      },
      connected: {
        title: 'Canlı: yeni büyük transferler bekleniyor',
        detail: 'Bu sekme arka plandayken uyarılar sistem bildirimi olarak da gelir.',
      },
      'needs-permission': {
        title: 'Uyarıları almak için bildirimlere izin verin',
        detail:
          'Butona tıklayın ve tarayıcının sorusunda "İzin ver"i seçin. Soru görünmezse adres çubuğunun sağındaki zil simgesine tıklayın.',
      },
      blocked: {
        title: 'Bildirimler bu site için engellenmiş',
        detail:
          'Adres çubuğunun solundaki simgeye tıklayın, Bildirimler iznini "İzin ver" yapın ve sayfayı yenileyin.',
      },
      unsupported: {
        title: 'Bu tarayıcı anlık bildirimleri desteklemiyor',
        detail: 'Chrome, Edge veya Firefox kullanın. Gizli (incognito) pencerelerde bildirimler çalışmaz.',
      },
      error: { title: 'Bağlantı kurulamadı' },
    },
    enableNotifications: 'Bildirimleri etkinleştir',
    tryAgain: 'Tekrar dene',
    errors: {
      'missing-config': 'frontend/.env dosyasında eksik ayarlar var:',
      'push-registration-failed':
        'Tarayıcı anlık bildirim servisine kaydolamadı; tarayıcınız bu servisi engelliyor olabilir (Brave: Ayarlar → Gizlilik ve güvenlik → "Use Google services for push messaging" açık olmalı). Chrome, Edge veya Firefox deneyin.',
      'backend-unreachable': 'Sunucuya ulaşılamadı. Backend çalışıyor mu?',
      'backend-rejected': 'Sunucu aboneliği kabul etmedi.',
      unknown: 'Beklenmeyen bir hata oluştu.',
    },
    alertsTitle: 'Son büyük transferler',
    alertCount: (count) => `${count} uyarı`,
    showingNewest: (max) => ` (en yeni ${max} gösteriliyor)`,
    emptyConnected:
      "Henüz büyük transfer gelmedi. Ethereum'da yaklaşık 12 saniyede bir yeni blok oluşur; ilk uyarılar genellikle bir dakika içinde gelir.",
    emptyNotConnected: 'Bağlantı kurulduğunda uyarılar burada listelenir.',
    from: 'Gönderen',
    to: 'Alıcı',
    txHash: "İşlem hash'i",
    block: 'Blok',
    openOnEtherscan: "Etherscan'da aç",
    footerBeforeContract: "Veriler Ethereum Mainnet'teki USDT sözleşmesinden gelir (",
    footerAfterContract: '). Bu sayfa açıkken gelen uyarılar listelenir.',
  },
  en: {
    locale: 'en-US',
    title: 'USDT Large Transfer Alert',
    subtitle: 'Every transfer of 100,000 USDT or more on Ethereum appears here instantly.',
    status: {
      checking: { title: 'Checking your browser…' },
      connecting: {
        title: 'Connecting…',
        detail: 'If your browser asks for notification permission, choose "Allow".',
      },
      connected: {
        title: 'Live: waiting for new large transfers',
        detail: 'While this tab is in the background, alerts also arrive as system notifications.',
      },
      'needs-permission': {
        title: 'Allow notifications to receive alerts',
        detail:
          'Click the button and choose "Allow" when your browser asks. If no prompt appears, click the bell icon at the right end of the address bar.',
      },
      blocked: {
        title: 'Notifications are blocked for this site',
        detail:
          'Click the icon to the left of the address bar, set Notifications to "Allow", then reload the page.',
      },
      unsupported: {
        title: 'This browser does not support push notifications',
        detail: "Use Chrome, Edge or Firefox. Notifications also don't work in private (incognito) windows.",
      },
      error: { title: 'Could not connect' },
    },
    enableNotifications: 'Enable notifications',
    tryAgain: 'Try again',
    errors: {
      'missing-config': 'Some settings are missing in frontend/.env:',
      'push-registration-failed':
        'The browser could not register with its push service; it may be blocking it (in Brave, turn on Settings → Privacy and security → "Use Google services for push messaging"). Try Chrome, Edge or Firefox.',
      'backend-unreachable': 'Could not reach the server. Is the backend running?',
      'backend-rejected': 'The server rejected the subscription.',
      unknown: 'An unexpected error occurred.',
    },
    alertsTitle: 'Latest large transfers',
    alertCount: (count) => `${count} ${count === 1 ? 'alert' : 'alerts'}`,
    showingNewest: (max) => ` (showing the newest ${max})`,
    emptyConnected:
      'No large transfers yet. Ethereum adds a new block about every 12 seconds; the first alerts usually arrive within a minute.',
    emptyNotConnected: 'Alerts will be listed here once connected.',
    from: 'From',
    to: 'To',
    txHash: 'Transaction hash',
    block: 'Block',
    openOnEtherscan: 'Open on Etherscan',
    footerBeforeContract: 'Data comes from the USDT contract on Ethereum Mainnet (',
    footerAfterContract: '). Alerts that arrive while this page is open are listed here.',
  },
}
