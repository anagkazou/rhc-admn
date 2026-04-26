import Image from 'next/image'
import { requireAdmin } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { logout } from './actions'

const PAGE_SIZE = 20

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const admin = await requireAdmin()
  const { page: pageParam } = await searchParams

  const parsedPage = Number.parseInt(pageParam ?? '1', 10)
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()
  const { data: submissions, error, count } = await supabase
    .from('contact_submissions')
    .select('id, telegram_username, email, message, created_at', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range(from, to)

  const total = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const showingFrom = total === 0 ? 0 : from + 1
  const showingTo = Math.min(from + (submissions?.length ?? 0), total)

  return (
    <main className="flex-1">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Image
              src="/crest.png"
              alt="Roll High Club"
              width={55}
              height={36}
              priority
              className="mt-1 h-9 w-auto"
            />
            <div className="space-y-1">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-gold">
                Contact submissions
              </h1>
              <p className="text-sm text-muted-foreground">
                Signed in as {admin.authEmail}
              </p>
            </div>
          </div>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </header>

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Failed to load submissions</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        ) : total === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-sm text-muted-foreground">No submissions yet.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <p className="mb-4 text-sm text-muted-foreground">
              Showing {showingFrom}–{showingTo} of {total}
            </p>
            <div className="flex flex-col gap-4">
              {submissions!.map((s) => (
                <SubmissionCard key={s.id} submission={s} />
              ))}
            </div>

            {totalPages > 1 ? (
              <PaginationControls page={page} totalPages={totalPages} />
            ) : null}
          </>
        )}
      </div>
    </main>
  )
}

type Submission = {
  id: number
  telegram_username: string
  email: string
  message: string
  created_at: string | null
}

function SubmissionCard({ submission }: { submission: Submission }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">@{submission.telegram_username}</Badge>
            <a
              href={`mailto:${submission.email}`}
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {submission.email}
            </a>
          </div>
          <span className="font-sans text-xs text-muted-foreground">
            {submission.created_at
              ? dateFormatter.format(new Date(submission.created_at))
              : '—'}
          </span>
        </div>
      </CardHeader>
      <Separator />
      <CardContent>
        <div className="text-[15px] leading-relaxed whitespace-pre-line break-words">
          {submission.message}
        </div>
      </CardContent>
    </Card>
  )
}

function PaginationControls({
  page,
  totalPages,
}: {
  page: number
  totalPages: number
}) {
  const hasPrev = page > 1
  const hasNext = page < totalPages
  const prevHref = hasPrev ? pageHref(page - 1) : undefined
  const nextHref = hasNext ? pageHref(page + 1) : undefined

  return (
    <Pagination className="mt-8 justify-between">
      <PaginationContent className="w-full justify-between">
        <PaginationItem>
          {hasPrev ? (
            <PaginationPrevious href={prevHref} />
          ) : (
            <PaginationPrevious aria-disabled className="pointer-events-none opacity-40" />
          )}
        </PaginationItem>

        <PaginationItem>
          <span className="px-2 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
        </PaginationItem>

        <PaginationItem>
          {hasNext ? (
            <PaginationNext href={nextHref} />
          ) : (
            <PaginationNext aria-disabled className="pointer-events-none opacity-40" />
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

function pageHref(page: number) {
  return page === 1 ? '/dashboard' : `/dashboard?page=${page}`
}
