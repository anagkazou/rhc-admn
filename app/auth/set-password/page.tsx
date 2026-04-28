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
import { SetPasswordForm } from './set-password-form'

export default async function SetPasswordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?error=invalid_invite')
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
            Set your password
          </CardTitle>
          <CardDescription>
            Welcome, {user.email}. Choose a password to finish setup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SetPasswordForm />
        </CardContent>
      </Card>
    </main>
  )
}
