import type { CollectionAfterChangeHook } from 'payload'

const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  )

const looksLikeEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)

/**
 * Emails each new enquiry to the people listed in Site settings › Enquiry recipients.
 * The enquiry is always saved in the CMS first, so a failed email never loses it.
 * Without a RESEND_API_KEY, Payload prints the email in the server log instead of sending it.
 */
export const emailEnquiry: CollectionAfterChangeHook = async ({ doc, operation, req }) => {
  if (operation !== 'create') return doc
  const { payload } = req
  try {
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0, req })
    const to = (settings.enquiryRecipients ?? []).map((r) => r.email).filter(Boolean)
    if (!to.length) {
      payload.logger.warn('New enquiry saved, but no Enquiry recipients are set in Site settings.')
      return doc
    }

    const formId = typeof doc.form === 'object' ? doc.form?.id : doc.form
    const form = formId
      ? await payload.findByID({ collection: 'forms', id: formId, depth: 0, req }).catch(() => null)
      : null
    const labels = new Map<string, string>(
      (form?.fields ?? []).flatMap((f) =>
        'name' in f && f.name
          ? [[f.name, ('label' in f && f.label) || f.name] as [string, string]]
          : [],
      ),
    )

    const rows: { field: string; value: string }[] = (doc.submissionData ?? []).map(
      (r: { field: string; value: unknown }) => ({
        field: labels.get(r.field) || r.field,
        value: String(r.value ?? ''),
      }),
    )
    const replyTo = rows.find((r) => looksLikeEmail(r.value.trim()))?.value.trim()
    const name = rows.find((r) => /name/i.test(r.field))?.value
    const adminUrl = `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/admin/collections/form-submissions/${doc.id}`

    await payload.sendEmail({
      to,
      ...(replyTo ? { replyTo } : {}),
      subject: `New website enquiry${name ? ` from ${name}` : ''}`,
      text: [...rows.map((r) => `${r.field}: ${r.value}`), '', `View in the CMS: ${adminUrl}`].join(
        '\n',
      ),
      html: `<p>New enquiry from the website${form?.title ? ` (${escape(form.title)})` : ''}:</p>
<table cellpadding="6" style="border-collapse:collapse">${rows
        .map(
          (r) =>
            `<tr><th align="left" valign="top">${escape(r.field)}</th><td style="white-space:pre-wrap">${escape(r.value)}</td></tr>`,
        )
        .join('')}</table>
<p><a href="${escape(adminUrl)}">View it in the CMS</a>. Reply to this email to answer the sender.</p>`,
    })
    payload.logger.info(`Enquiry ${doc.id} emailed to ${to.length} recipient(s).`)
  } catch (err) {
    payload.logger.error({ err, msg: `Enquiry ${doc.id} saved, but the email failed.` })
  }
  return doc
}
