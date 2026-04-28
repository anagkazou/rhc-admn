'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { requireAdmin } from '@/lib/dal'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export type InviteState =
  | { ok: true }
  | { error: string }
  | undefined

export async function inviteAdmin(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  await requireAdmin()

  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!email) return { error: 'Email is required.' }

  const admin = createAdminClient()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  let origin: string
  if (siteUrl) {
    origin = siteUrl.replace(/\/$/, '')
  } else {
    const h = await headers()
    const proto = h.get('x-forwarded-proto') ?? 'http'
    const host = h.get('host') ?? 'localhost:3000'
    origin = `${proto}://${host}`
  }
  const redirectTo = `${origin}/auth/callback`

  // Note: built-in Supabase invite. The user must click the email link, which
  // sends them to /auth/callback (it handles both hash-token and code flows).
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo,
  })

  if (error || !data.user) {
    const message = error?.message ?? 'Could not send invite.'
    if (message.toLowerCase().includes('already')) {
      return {
        error: `${email} already has an account. Add them manually via SQL for now.`,
      }
    }
    return { error: message }
  }

  // Pre-grant admin status so they can use the dashboard immediately on accept.
  // Service role bypasses RLS — we set both id (FK to auth.users.id) and email.
  const { error: insertError } = await admin
    .from('admin_users')
    .insert({ id: data.user.id, email })

  if (insertError) {
    return { error: `Invite sent but admin grant failed: ${insertError.message}` }
  }

  revalidatePath('/dashboard/admins')
  return { ok: true }
}

export async function removeAdmin(formData: FormData) {
  await requireAdmin()

  const id = String(formData.get('id') ?? '')
  if (!id) throw new Error('Missing admin id')

  const supabase = await createClient()
  const { error } = await supabase.from('admin_users').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/admins')
}
