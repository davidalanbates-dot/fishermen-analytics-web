'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

/**
 * Main navigation. Marks the current section with aria-current (shown in yellow).
 * On phones the links collapse behind a Menu button.
 */
export function NavLinks({
  links,
  menuLabel,
  closeLabel,
}: {
  links: { label: string; href: string }[]
  menuLabel: string
  closeLabel: string
}) {
  const pathname = usePathname() || '/'
  const [open, setOpen] = useState(false)
  const isCurrent = (href: string) =>
    href === '/' || href === '/ms' ? pathname === href : pathname.startsWith(href)

  return (
    <>
      <button
        type="button"
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="main-menu"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? closeLabel : menuLabel}
      </button>
      <ul id="main-menu" data-open={open}>
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={isCurrent(link.href) ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
