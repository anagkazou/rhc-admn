import { requireAdmin } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { InviteAdminDialog } from './invite-dialog'
import { RemoveAdminButton } from './remove-admin-button'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
})

export default async function AdminsPage() {
  const me = await requireAdmin()

  const supabase = await createClient()
  const { data: admins, error } = await supabase
    .from('admin_users')
    .select('id, email, created_at')
    .order('created_at', { ascending: true })

  const total = admins?.length ?? 0

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-gold sm:text-3xl">
            Admins
          </h1>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? 'admin' : 'admins'}
          </p>
        </div>
        <InviteAdminDialog />
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Failed to load admins</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : total === 0 ? (
        <div className="rounded-xl bg-card py-16 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
          No admins.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow className="bg-card-deep hover:bg-card-deep">
                <TableHead className="px-4">Email</TableHead>
                <TableHead className="hidden px-4 sm:table-cell">Added</TableHead>
                <TableHead className="px-4 text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins!.map((a) => {
                const isMe = a.id === me.id
                return (
                  <TableRow key={a.id}>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{a.email}</span>
                        {isMe ? (
                          <Badge variant="secondary">You</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell">
                      {a.created_at
                        ? dateFormatter.format(new Date(a.created_at))
                        : '—'}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      {isMe ? null : (
                        <RemoveAdminButton id={a.id} email={a.email} />
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  )
}
