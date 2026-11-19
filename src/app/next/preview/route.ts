import { draftMode, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@/payload.config'

/**
 * Opened by the CMS Preview button and Live Preview. Only a logged-in CMS user (checked from
 * their admin session cookie) can switch on draft mode, which shows unpublished changes.
 * Only paths on this site are accepted, so the route can't be used to redirect elsewhere.
 */
export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get('path') || '/'
  if (!path.startsWith('/') || path.startsWith('//')) {
    return new Response('Invalid preview path', { status: 400 })
  }

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) {
    return new Response('Log in to the CMS to preview drafts.', { status: 403 })
  }

  ;(await draftMode()).enable()
  redirect(path)
}
