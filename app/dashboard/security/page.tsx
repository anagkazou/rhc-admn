import { ShieldCheckIcon, TrashIcon } from 'lucide-react'
import { requireAdmin } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { TotpSetup } from './totp-setup'
import { unenrollFactor } from './actions'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export default async function SecurityPage() {
  await requireAdmin()

  const supabase = await createClient()
  const { data: factors } = await supabase.auth.mfa.listFactors()
  const verified = factors?.totp ?? []

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-gold sm:text-3xl">
          Two-factor authentication
        </h1>
        <p className="text-sm text-muted-foreground">
          Add an extra step at sign-in by linking an authenticator app.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="font-display text-lg text-gold">
                Authenticator app
              </CardTitle>
              {verified.length > 0 ? (
                <Badge variant="secondary">
                  <ShieldCheckIcon className="size-3" />
                  Active
                </Badge>
              ) : null}
            </div>
            <CardDescription>
              Time-based one-time passcodes (TOTP) — works with any standard
              authenticator app.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {verified.length === 0 ? (
              <TotpSetup />
            ) : (
              <ul className="flex flex-col gap-3">
                {verified.map((f) => (
                  <li
                    key={f.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card-deep px-3 py-2 text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {f.friendly_name ?? 'Authenticator'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Added{' '}
                        {f.created_at
                          ? dateFormatter.format(new Date(f.created_at))
                          : '—'}
                      </span>
                    </div>
                    <form action={unenrollFactor}>
                      <input type="hidden" name="factorId" value={f.id} />
                      <Button type="submit" variant="destructive" size="sm">
                        <TrashIcon />
                        Remove
                      </Button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
