import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

export const getCurrentAdmin = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, email')
    .eq('id', user.id)
    .maybeSingle()

  if (error || !data) return null
  return { ...data, authEmail: user.email ?? data.email }
})

export const getMfaStatus = cache(async () => {
  const supabase = await createClient()
  const { data: aal } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  const { data: factors } = await supabase.auth.mfa.listFactors()
  const verifiedTotp = factors?.totp?.length ?? 0
  return {
    currentLevel: aal?.currentLevel ?? null,
    nextLevel: aal?.nextLevel ?? null,
    hasVerifiedFactor: verifiedTotp > 0,
    needsChallenge:
      aal?.currentLevel === 'aal1' && aal?.nextLevel === 'aal2',
  }
})

export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const admin = await getCurrentAdmin()
  if (!admin) redirect('/login?error=not_admin')

  const mfa = await getMfaStatus()
  if (mfa.needsChallenge) {
    redirect('/auth/mfa-challenge')
  }

  return admin
}
