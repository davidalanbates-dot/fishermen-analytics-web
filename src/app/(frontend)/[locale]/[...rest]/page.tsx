import { notFound } from 'next/navigation'

/** Any URL without a page of its own shows the site's styled 404 (inside the layout). */
export default function CatchAll() {
  notFound()
}
