import Script from 'next/script'

/**
 * GA4 and Google Search Console, configured in the CMS (Site settings › Tracking).
 * Nothing loads until a measurement ID is entered. GA4 loads after the page is
 * interactive so it never delays the first paint. Custom events (game, enquiry form,
 * work filter) go through src/lib/analytics.ts.
 */
export function Analytics({
  measurementId,
  verification,
  enabled,
}: {
  measurementId?: string | null
  verification?: string | null
  enabled: boolean
}) {
  const id = measurementId?.trim()
  const validId = id && /^G-[A-Z0-9]+$/i.test(id) ? id : null
  return (
    <>
      {verification ? <meta name="google-site-verification" content={verification} /> : null}
      {enabled && validId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${validId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${validId}');`}
          </Script>
        </>
      ) : null}
    </>
  )
}
