# Backend (NestJS)

USDT `Transfer` olaylarını Ethereum Mainnet'te izler ve 100.000 USDT ve üzeri transferleri Firebase Cloud Messaging ile gönderir. Kurulum ve genel bilgi için [ana README](../README.md) dosyasına bakın.

## Komutlar

| Komut | Açıklama |
|---|---|
| `npm run start:dev` | Geliştirme modunda başlatır; dosya kaydedildiğinde yeniden başlar |
| `npm run build` | `dist/` klasörüne derler |
| `npm run start:prod` | Derlenmiş uygulamayı çalıştırır (önce `npm run build`) |
| `npm test` | Birim testleri |
| `npm run test:e2e` | HTTP uçtan uca testleri |
| `npm run lint` | Kod kontrolü (Oxlint) |
| `npm run format` | Kod biçimlendirme (Prettier) |

Ortam değişkenleri için [`.env.example`](.env.example) dosyasına bakın.
