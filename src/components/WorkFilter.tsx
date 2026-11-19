'use client'

import { useState, type ReactNode } from 'react'

import { track } from '@/lib/analytics'

/** Filter chips over server-rendered case study cards. No JS: every card shows. */
export function WorkFilter(props: {
  label: string
  allLabel: string
  options: { slug: string; title: string }[]
  items: { id: number; services: string[]; card: ReactNode }[]
}) {
  const [active, setActive] = useState<string | null>(null)
  const shown = active ? props.items.filter((i) => i.services.includes(active)) : props.items

  const choose = (slug: string | null) => {
    setActive(slug)
    track('work_filter', { service: slug ?? 'all' })
  }

  return (
    <>
      <div className="filters" role="group" aria-label={props.label}>
        <button type="button" aria-pressed={active === null} onClick={() => choose(null)}>
          {props.allLabel}
        </button>
        {props.options.map((o) => (
          <button
            key={o.slug}
            type="button"
            aria-pressed={active === o.slug}
            onClick={() => choose(o.slug)}
          >
            {o.title}
          </button>
        ))}
      </div>
      <div className="cards" aria-live="polite">
        {shown.map((i) => (
          <div key={i.id} style={{ display: 'contents' }}>
            {i.card}
          </div>
        ))}
      </div>
    </>
  )
}
