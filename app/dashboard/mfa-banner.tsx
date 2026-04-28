'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShieldAlertIcon } from 'lucide-react'

export function MfaBanner() {
  const pathname = usePathname()
  if (pathname?.startsWith('/dashboard/security')) return null

  return (
    <div className="border-b border-gold/30 bg-gold/10 text-sm text-gold">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-2 px-4 py-2 sm:px-6">
        <ShieldAlertIcon className="size-4 shrink-0" />
        <span className="text-foreground/90">
          Two-factor authentication isn&apos;t set up. Recommended for admin
          accounts.
        </span>
        <Link
          href="/dashboard/security"
          className="ml-auto font-medium underline-offset-4 hover:underline"
        >
          Set it up →
        </Link>
      </div>
    </div>
  )
}
