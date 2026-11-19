import { RichText } from '@payloadcms/richtext-lexical/react'

import { t } from '@/i18n/dictionary'
import { getSiteSettings, populated } from '@/lib/payload'
import type { Form } from '@/payload-types'
import { EnquiryFormClient, type FormField } from './EnquiryFormClient'
import type { BlockProps } from './types'

/** Form fields the site renders. Anything else added in the CMS is skipped. */
const supported = ['text', 'email', 'textarea', 'select', 'checkbox', 'number'] as const

function toFields(form: Form): FormField[] {
  return (form.fields ?? []).flatMap((f) => {
    if (!supported.includes(f.blockType as (typeof supported)[number]) || !('name' in f)) return []
    return [
      {
        type: f.blockType as FormField['type'],
        name: f.name,
        label: ('label' in f && f.label) || f.name,
        required: Boolean('required' in f && f.required),
        width: ('width' in f && f.width) || 100,
        options:
          f.blockType === 'select'
            ? (f.options ?? []).map((o) => ({ label: o.label, value: o.value }))
            : undefined,
        defaultValue:
          'defaultValue' in f && f.defaultValue != null ? String(f.defaultValue) : undefined,
      },
    ]
  })
}

export async function EnquiryFormBlock({ block, locale }: BlockProps<'enquiryForm'>) {
  const d = t(locale)
  const form = populated(block.form)
  const settings = await getSiteSettings(locale)
  if (!form) return null

  return (
    <section className="section" id="enquiry">
      <div className="wrap">
        <div className="enquiry-box">
          <div>
            <p className="kicker">{d.kickers.contact}</p>
            {block.heading ? <h2 className="h2">{block.heading}</h2> : null}
            {block.intro || settings.replyTime ? (
              <p className="intro">
                {block.intro} {settings.replyTime}
              </p>
            ) : null}
          </div>
          <EnquiryFormClient
            formId={form.id}
            fields={toFields(form)}
            submitLabel={form.submitButtonLabel || (locale === 'ms' ? 'Hantar' : 'Send')}
            text={{ sending: d.form.sending, error: d.form.error }}
            confirmation={
              form.confirmationMessage ? <RichText data={form.confirmationMessage} /> : null
            }
          />
        </div>
      </div>
    </section>
  )
}
