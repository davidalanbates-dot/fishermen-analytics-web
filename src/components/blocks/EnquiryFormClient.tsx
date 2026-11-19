'use client'

import { useId, useState, type FormEvent, type ReactNode } from 'react'

export type FormField = {
  type: 'text' | 'email' | 'textarea' | 'select' | 'checkbox' | 'number'
  name: string
  label: string
  required: boolean
  width: number
  options?: { label: string; value: string }[]
  defaultValue?: string
}

const autocomplete: Record<string, string> = {
  name: 'name',
  company: 'organization',
  email: 'email',
  phone: 'tel',
}

/** Posts to Payload's form-builder endpoint; submissions appear in the CMS under Enquiries. */
export function EnquiryFormClient(props: {
  formId: number
  fields: FormField[]
  submitLabel: string
  text: { sending: string; error: string }
  confirmation: ReactNode
}) {
  const uid = useId()
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const submissionData = props.fields.map((f) => ({
      field: f.name,
      value:
        f.type === 'checkbox' ? String(data.get(f.name) === 'on') : String(data.get(f.name) ?? ''),
    }))
    setStatus('sending')
    try {
      const res = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form: props.formId, submissionData }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('done')
      window.dispatchEvent(new CustomEvent('fa:enquiry_submitted'))
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="form-done" role="status">
        {props.confirmation}
      </div>
    )
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate={false}>
      {props.fields.map((f) => {
        const id = `${uid}-${f.name}`
        const full = f.width >= 100 || f.type === 'textarea'
        const common = {
          id,
          name: f.name,
          required: f.required,
          autoComplete: autocomplete[f.name],
          defaultValue: f.defaultValue,
        }
        return (
          <div key={f.name} className={`field${full ? ' full' : ''}`}>
            <label htmlFor={id}>
              {f.label}
              {f.required ? ' *' : ''}
            </label>
            {f.type === 'textarea' ? (
              <textarea rows={4} {...common} />
            ) : f.type === 'select' ? (
              <select {...common}>
                {(f.options ?? []).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : f.type === 'checkbox' ? (
              <input type="checkbox" {...common} defaultValue={undefined} />
            ) : (
              <input
                type={f.type === 'email' ? 'email' : f.name === 'phone' ? 'tel' : f.type}
                {...common}
              />
            )}
          </div>
        )
      })}
      <div className="actions">
        <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
          {status === 'sending' ? props.text.sending : props.submitLabel}
        </button>
        <p
          className={`form-status${status === 'error' ? ' error' : ''}`}
          role="status"
          aria-live="polite"
        >
          {status === 'error' ? props.text.error : ''}
        </p>
      </div>
    </form>
  )
}
