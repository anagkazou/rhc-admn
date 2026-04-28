'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { ShieldPlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  completeEnrollment,
  startEnrollment,
  type EnrollResult,
  type VerifyState,
} from './actions'

type EnrollData = Extract<EnrollResult, { ok: true }>

export function TotpSetup() {
  const [enrollment, setEnrollment] = useState<EnrollData | null>(null)
  const [startError, setStartError] = useState<string | null>(null)
  const [starting, startTransition] = useTransition()
  const [verifyState, verifyAction, verifying] = useActionState<
    VerifyState,
    FormData
  >(completeEnrollment, undefined)

  useEffect(() => {
    if (verifyState && 'ok' in verifyState && verifyState.ok) {
      setEnrollment(null)
    }
  }, [verifyState])

  function handleStart() {
    setStartError(null)
    startTransition(async () => {
      const result = await startEnrollment()
      if (result.ok) {
        setEnrollment(result)
      } else {
        setStartError(result.error)
      }
    })
  }

  if (!enrollment) {
    return (
      <div className="flex flex-col gap-3">
        <Button onClick={handleStart} disabled={starting} className="w-fit">
          <ShieldPlusIcon />
          {starting ? 'Starting…' : 'Set up authenticator'}
        </Button>
        {startError ? (
          <p className="text-sm text-destructive">{startError}</p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <ol className="list-decimal space-y-3 pl-5 text-sm text-muted-foreground marker:text-gold">
        <li>
          Scan the QR code in your authenticator app (1Password, Authy, Google
          Authenticator, etc.).
        </li>
        <li>Enter the 6-digit code the app shows below.</li>
      </ol>

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="rounded-lg bg-white p-3">
          {/* QR is a data: URL returned by Supabase */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={enrollment.qrCode}
            alt="Authenticator QR code"
            width={172}
            height={172}
            className="block"
          />
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <span className="text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
            Manual entry
          </span>
          <code className="rounded-md border border-border bg-card-deep px-2 py-1 font-mono text-xs break-all">
            {enrollment.secret}
          </code>
          <p className="text-xs text-muted-foreground">
            Use this if you can&apos;t scan the QR code.
          </p>
        </div>
      </div>

      <form action={verifyAction} className="flex flex-col gap-3">
        <input type="hidden" name="factorId" value={enrollment.factorId} />
        <div className="grid gap-2">
          <Label htmlFor="enroll-code">Verification code</Label>
          <Input
            id="enroll-code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            placeholder="123456"
            required
            className="max-w-[12rem] tracking-[0.4em] text-center"
          />
        </div>

        {verifyState && 'error' in verifyState ? (
          <p className="text-sm text-destructive">{verifyState.error}</p>
        ) : null}

        <div className="flex gap-2">
          <Button type="submit" disabled={verifying}>
            {verifying ? 'Verifying…' : 'Verify and enable'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setEnrollment(null)}
            disabled={verifying}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
