import { createClient } from '@/lib/supabase/server'
import type { SubmissionTable } from '@/lib/supabase/database.types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { SubmissionsTable } from './submissions-table'

const PAGE_SIZE = 20

type Props = {
  table: SubmissionTable
  title: string
  basePath: string
  page: number
}

export async function SubmissionsListView({ table, title, basePath, page }: Props) {
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()
  const {
    data: submissions,
    error,
    count,
  } = await supabase
    .from(table)
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
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-gold sm:text-3xl">
          {title}
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
              <PaginationControls
                page={page}
                totalPages={totalPages}
                basePath={basePath}
              />
            ) : null}
          </div>
        </div>
      )}
    </>
  )
}

function PaginationControls({
  page,
  totalPages,
  basePath,
}: {
  page: number
  totalPages: number
  basePath: string
}) {
  const hasPrev = page > 1
  const hasNext = page < totalPages
  const href = (n: number) => (n === 1 ? basePath : `${basePath}?page=${n}`)

  return (
    <Pagination className="w-auto justify-end">
      <PaginationContent>
        <PaginationItem>
          {hasPrev ? (
            <PaginationPrevious href={href(page - 1)} />
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
            <PaginationNext href={href(page + 1)} />
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

export function parsePage(pageParam: string | undefined): number {
  const parsed = Number.parseInt(pageParam ?? '1', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}
