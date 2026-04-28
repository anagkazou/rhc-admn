import { TrashIcon } from 'lucide-react'
import { requireAdmin } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { terminateSession } from './actions'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export default async function SessionsPage() {
  await requireAdmin()

  const supabase = await createClient()
  const { data: sessions, error } = await supabase.rpc('list_admin_sessions')

  const total = sessions?.length ?? 0

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-gold sm:text-3xl">
          Active sessions
        </h1>
        <p className="text-sm text-muted-foreground">
          {total} signed in
        </p>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Failed to load sessions</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : total === 0 ? (
        <div className="rounded-xl bg-card py-16 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
          No active sessions.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow className="bg-card-deep hover:bg-card-deep">
                <TableHead className="px-4">Admin</TableHead>
                <TableHead className="hidden px-4 md:table-cell">Device</TableHead>
                <TableHead className="px-4">Last active</TableHead>
                <TableHead className="px-4 text-right">
                  <span className="sr-only">Terminate</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions!.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="px-4 py-3">{s.email}</TableCell>
                  <TableCell
                    className="hidden max-w-[16rem] truncate px-4 py-3 text-muted-foreground md:table-cell"
                    title={s.user_agent ?? undefined}
                  >
                    {summarizeUserAgent(s.user_agent)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-xs text-muted-foreground">
                    {formatTimestamp(s.refreshed_at ?? s.created_at)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <form action={terminateSession}>
                      <input type="hidden" name="sessionId" value={s.id} />
                      <Button type="submit" variant="destructive" size="sm">
                        <TrashIcon />
                        Terminate
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  )
}

function formatTimestamp(value: string | null): string {
  if (!value) return '—'
  const normalized =
    value.includes('T') || value.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(value)
      ? value
      : value.replace(' ', 'T') + 'Z'
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return '—'
  return dateFormatter.format(date)
}

function summarizeUserAgent(ua: string | null): string {
  if (!ua) return '—'

  let browser = 'Unknown browser'
  if (/Edg\//.test(ua)) browser = 'Edge'
  else if (/OPR\//.test(ua)) browser = 'Opera'
  else if (/Chrome\//.test(ua)) browser = 'Chrome'
  else if (/Firefox\//.test(ua)) browser = 'Firefox'
  else if (/Safari\//.test(ua)) browser = 'Safari'

  let os = 'Unknown OS'
  if (/Windows/.test(ua)) os = 'Windows'
  else if (/iPhone|iPad/.test(ua)) os = 'iOS'
  else if (/Android/.test(ua)) os = 'Android'
  else if (/Mac OS X|Macintosh/.test(ua)) os = 'macOS'
  else if (/Linux/.test(ua)) os = 'Linux'

  return `${browser} · ${os}`
}
