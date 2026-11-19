import Image from 'next/image'
import type { Locale } from '@/i18n/config'

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <Image
          src="/brand/fishermen-analytics-logo-wide.png"
          alt="Fishermen Analytics"
          width={240}
          height={80}
          style={{ height: 'auto' }}
        />
        <p>
          {locale === 'en'
            ? 'Part of the Fishermen family, alongside '
            : 'Sebahagian daripada keluarga Fishermen, bersama '}
          <a href="https://www.fishermen.co">Fishermen Integrated</a>.
        </p>
        <p className="small">© {new Date().getFullYear()} Fishermen Analytics Sdn Bhd</p>
      </div>
    </footer>
  )
}
