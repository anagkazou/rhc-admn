'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type ChallengeState = { error: string } | undefined

export async function verifyMfaChallenge(
  _prev: ChallengeState,
  formData: FormData,
): Promise<ChallengeState> {
  const code = String(formData.get('code') ?? '').trim()
  if (!/^\d{6}$/.test(code)) {
    return { error: 'Enter the 6-digit code from your authenticator.' }
  }

  const supabase = await createClient()
  const { data: factors, error: listError } =
    await supabase.auth.mfa.listFactors()
  if (listError) return { error: listError.message }

  const factor = factors?.totp?.[0]
  if (!factor) {
    return { error: 'No verified authenticator factor on this account.' }
  }

  const { data: challenge, error: challengeError } =
    await supabase.auth.mfa.challenge({ factorId: factor.id })
  if (challengeError) return { error: challengeError.message }

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId: factor.id,
    challengeId: challenge.id,
    code,
  })
  if (verifyError) return { error: verifyError.message }

  redirect('/dashboard')
}
