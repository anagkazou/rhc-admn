'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/dal'
import { createClient } from '@/lib/supabase/server'

export async function terminateSession(formData: FormData) {
  await requireAdmin()

  const sessionId = String(formData.get('sessionId') ?? '')
  if (!sessionId) {
    throw new Error('Missing session id')
  }

  const supabase = await createClient()
  const { error } = await supabase.rpc('terminate_session', {
    target_session_id: sessionId,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/sessions')
}
