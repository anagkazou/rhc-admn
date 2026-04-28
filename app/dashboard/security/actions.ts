'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'

export type EnrollResult =
  | { ok: true; factorId: string; qrCode: string; secret: string; uri: string }
  | { ok: false; error: string }

export async function startEnrollment(): Promise<EnrollResult> {
  await requireAdmin()
  const supabase = await createClient()

  // Clean up any in-progress (unverified) factor before starting fresh.
  const { data: factors } = await supabase.auth.mfa.listFactors()
  for (const factor of factors?.all ?? []) {
    if (factor.status === 'unverified') {
      await supabase.auth.mfa.unenroll({ factorId: factor.id })
    }
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName: `Authenticator ${new Date().toISOString().slice(0, 10)}`,
  })
  if (error || !data) {
    return { ok: false, error: error?.message ?? 'Could not start enrollment.' }
  }

  return {
    ok: true,
    factorId: data.id,
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
    uri: data.totp.uri,
  }
}

export type VerifyState = { error: string } | { ok: true } | undefined

export async function completeEnrollment(
  _prev: VerifyState,
  formData: FormData,
): Promise<VerifyState> {
  await requireAdmin()

  const factorId = String(formData.get('factorId') ?? '')
  const code = String(formData.get('code') ?? '').trim()

  if (!factorId) return { error: 'Missing factor id.' }
  if (!/^\d{6}$/.test(code)) {
    return { error: 'Enter the 6-digit code from your authenticator.' }
  }

  const supabase = await createClient()

  const { data: challenge, error: challengeError } =
    await supabase.auth.mfa.challenge({ factorId })
  if (challengeError) return { error: challengeError.message }

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code,
  })
  if (verifyError) return { error: verifyError.message }

  revalidatePath('/dashboard/security')
  return { ok: true }
}

export async function unenrollFactor(formData: FormData) {
  await requireAdmin()

  const factorId = String(formData.get('factorId') ?? '')
  if (!factorId) throw new Error('Missing factor id')

  const supabase = await createClient()
  const { error } = await supabase.auth.mfa.unenroll({ factorId })
  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/security')
}
