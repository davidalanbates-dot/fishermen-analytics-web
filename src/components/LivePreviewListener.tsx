'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

/** Inside the CMS Live Preview panel, re-renders the page whenever the editor's draft autosaves. */
export function LivePreviewListener({ serverURL }: { serverURL: string }) {
  const router = useRouter()
  return <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={serverURL} />
}
