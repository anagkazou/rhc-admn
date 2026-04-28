'use client'

import { useActionState, useEffect, useState } from 'react'
import { UserPlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { inviteAdmin, type InviteState } from './actions'

export function InviteAdminDialog() {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState<InviteState, FormData>(
    inviteAdmin,
    undefined,
  )

  useEffect(() => {
    if (state && 'ok' in state && state.ok) {
      setOpen(false)
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <UserPlusIcon />
            Invite admin
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <form action={formAction} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-gold">
              Invite admin
            </DialogTitle>
            <DialogDescription>
              We’ll email an invite link. They’ll set a password before getting
              dashboard access.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              name="email"
              type="email"
              autoComplete="off"
              required
              placeholder="name@example.com"
            />
          </div>

          {state && 'error' in state ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Sending…' : 'Send invite'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
