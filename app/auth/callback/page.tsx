'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2Icon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const supabase = createClient()

    async function handle() {
      const url = new URL(window.location.href)
      const hashParams = new URLSearchParams(
        url.hash.startsWith('#') ? url.hash.slice(1) : '',
      )

      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const hashError = hashParams.get('error_description') ?? hashParams.get('error')

      if (hashError) {
        setError(hashError)
        return
      }

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (error) {
          setError(error.message)
          return
        }
        // Strip the hash so the tokens don't linger in browser history.
        window.history.replaceState({}, '', '/auth/callback')
        router.replace('/auth/set-password')
        return
      }

      const code = url.searchParams.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          setError(error.message)
          return
        }
        router.replace('/auth/set-password')
        return
      }

      setError('No invitation token found in the URL.')
    }

    handle()
  }, [router])

  if (error) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <h1 className="font-display text-2xl text-gold">Invalid invite</h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Loader2Icon
        aria-label="Completing sign-in"
        className="size-8 animate-spin text-muted-foreground"
      />
    </main>
  )
}
