import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

/**
 * Leaves draft mode and returns to the published version of the page the editor was on
 * (from ?path= or the Referer header, same site only).
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  let path = url.searchParams.get('path')
  const referer = request.headers.get('referer')
  if (!path && referer) {
    const from = new URL(referer)
    if (from.origin === url.origin) path = from.pathname
  }
  ;(await draftMode()).disable()
  redirect(path && path.startsWith('/') && !path.startsWith('//') ? path : '/')
}
