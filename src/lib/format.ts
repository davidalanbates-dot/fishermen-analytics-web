import type { Locale } from '@/i18n/config'

/** "19 November 2026" in English, "19 November 2026" in Malay date order. */
export const formatDate = (iso: string | null | undefined, locale: Locale) =>
  iso
    ? new Date(iso).toLocaleDateString(locale === 'ms' ? 'ms-MY' : 'en-MY', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null
