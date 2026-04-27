'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export type Submission = {
  id: number
  telegram_username: string
  email: string
  message: string
  created_at: string | null
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <dt className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="mt-1.5 text-sm text-foreground">{children}</dd>
    </div>
  )
}

export function SubmissionsTable({
  submissions,
}: {
  submissions: Submission[]
}) {
  const [selected, setSelected] = useState<Submission | null>(null)

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="bg-card-deep hover:bg-card-deep">
            <TableHead className="px-4">Telegram</TableHead>
            <TableHead className="hidden px-4 sm:table-cell">Email</TableHead>
            <TableHead className="hidden px-4 md:table-cell">Message</TableHead>
            <TableHead className="px-4 text-right">Received</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((s) => (
            <TableRow
              key={s.id}
              role="button"
              tabIndex={0}
              aria-label={`Open submission from @${s.telegram_username}`}
              onClick={() => setSelected(s)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setSelected(s)
                }
              }}
              className="cursor-pointer focus-visible:bg-muted/50 focus-visible:outline-none"
            >
              <TableCell className="px-4 py-3">
                <Badge variant="secondary">@{s.telegram_username}</Badge>
              </TableCell>
              <TableCell className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                {s.email}
              </TableCell>
              <TableCell className="hidden max-w-[28rem] truncate px-4 py-3 text-muted-foreground md:table-cell">
                {s.message}
              </TableCell>
              <TableCell className="px-4 py-3 text-right text-xs text-muted-foreground">
                {s.created_at
                  ? dateFormatter.format(new Date(s.created_at))
                  : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Sheet
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      >
        <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
          {selected ? (
            <>
              <SheetHeader className="gap-1 p-6">
                <SheetTitle className="font-display text-xl text-gold">
                  Submission details
                </SheetTitle>
              </SheetHeader>
              <Separator />
              <dl className="flex-1 space-y-6 overflow-y-auto p-6">
                <Field label="Telegram">
                  @{selected.telegram_username}
                </Field>
                <Field label="Email">
                  <a
                    href={`mailto:${selected.email}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {selected.email}
                  </a>
                </Field>
                <Field label="Received">
                  {selected.created_at
                    ? dateFormatter.format(new Date(selected.created_at))
                    : '—'}
                </Field>
                <Field label="Message">
                  <span className="block text-[15px] leading-relaxed break-words whitespace-pre-line">
                    {selected.message}
                  </span>
                </Field>
              </dl>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  )
}
