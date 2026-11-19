import { draftMode } from 'next/headers'

import type { Locale } from '@/i18n/config'
import { previewArgs } from '@/lib/payload'
import { LivePreviewListener } from './LivePreviewListener'

const TEXT = {
  en: { label: 'Preview: you are seeing unpublished changes.', exit: 'Exit preview' },
  ms: {
    label: 'Pratonton: anda melihat perubahan yang belum diterbitkan.',
    exit: 'Keluar pratonton',
  },
}

/**
 * Shown only in draft mode (CMS preview). Tells editors they are looking at drafts, offers a
 * way out, and refreshes the page as they edit in the CMS's Live Preview panel.
 */
export async function PreviewBar({ locale }: { locale: Locale }) {
  if (!(await draftMode()).isEnabled) return null
  const { user } = await previewArgs()
  const t = TEXT[locale]
  return (
    <>
      <div className="preview-bar" role="status">
        <span>{user ? t.label : 'Preview: log in to the CMS to see drafts.'}</span>
        {/* Plain link: leaving draft mode needs a full request to the exit route handler */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/next/exit-preview">{t.exit}</a>
      </div>
      <LivePreviewListener
        serverURL={process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}
      />
    </>
  )
}
