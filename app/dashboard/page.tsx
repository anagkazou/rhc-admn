import Image from 'next/image'
import { requireAdmin } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { SubmissionsTable } from './submissions-table'
import { logout } from './actions'

const PAGE_SIZE = 20

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
  const {
    data: submissions,
    error,
    count,
  } = await supabase
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
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-border bg-card-deep">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Image
              src="/crest.png"
              alt=""
              width={55}
              height={36}
              priority
              className="h-7 w-auto"
            />
            <span className="font-display text-base font-semibold text-gold sm:text-lg">
              Roll High Club
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {admin.authEmail}
            </span>
            <form action={logout}>
              <Button type="submit" variant="outline" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
          <div className="mb-6 sm:mb-8">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-gold sm:text-3xl">
              Contact submissions
            </h1>
            <p className="text-sm text-muted-foreground">{total} total</p>
          </div>

          {error ? (
            <Alert variant="destructive">
              <AlertTitle>Failed to load submissions</AlertTitle>
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          ) : total === 0 ? (
            <div className="rounded-xl bg-card py-16 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
              No submissions yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
              <SubmissionsTable submissions={submissions!} />
              <div className="flex flex-col items-start justify-between gap-3 border-t border-border bg-card-deep px-4 py-3 sm:flex-row sm:items-center">
                <p className="text-xs text-muted-foreground">
                  Showing {showingFrom}–{showingTo} of {total}
                </p>
                {totalPages > 1 ? (
                  <PaginationControls page={page} totalPages={totalPages} />
                ) : null}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
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

  return (
    <Pagination className="w-auto justify-end">
      <PaginationContent>
        <PaginationItem>
          {hasPrev ? (
            <PaginationPrevious href={pageHref(page - 1)} />
          ) : (
            <PaginationPrevious
              aria-disabled
              className="pointer-events-none opacity-40"
            />
          )}
        </PaginationItem>

        <PaginationItem>
          <span className="px-2 text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
        </PaginationItem>

        <PaginationItem>
          {hasNext ? (
            <PaginationNext href={pageHref(page + 1)} />
          ) : (
            <PaginationNext
              aria-disabled
              className="pointer-events-none opacity-40"
            />
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

function pageHref(page: number) {
  return page === 1 ? '/dashboard' : `/dashboard?page=${page}`
}
