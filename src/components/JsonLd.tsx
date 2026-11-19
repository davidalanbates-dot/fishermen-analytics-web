const LINE_SEPARATORS = new RegExp('[\\u2028\\u2029]', 'g')

/** Renders structured data. "<" and line separators are escaped so content can't break out. */
export function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(LINE_SEPARATORS, (c) => (c === ' ' ? '\\u2028' : '\\u2029'))
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
