import Image from 'next/image'
import { redirect } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { MfaChallengeForm } from './mfa-form'

export default async function MfaChallengePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  // If they're already aal2 (or no factor required), bounce them back.
  if (aal && aal.currentLevel === aal.nextLevel) {
    redirect('/dashboard')
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <Image
            src="/crest.png"
            alt="Roll High Club"
            width={88}
            height={58}
            priority
            className="mx-auto mb-3 h-12 w-auto"
          />
          <CardTitle className="font-display text-2xl font-semibold text-gold">
            Two-factor required
          </CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app to finish signing
            in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MfaChallengeForm />
        </CardContent>
      </Card>
    </main>
  )
}
