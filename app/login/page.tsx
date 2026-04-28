import Image from 'next/image'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { LoginForm } from './login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const notAdmin = error === 'not_admin'
  const invalidInvite = error === 'invalid_invite'

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
            Admin sign in
          </CardTitle>
          <CardDescription>Roll High Club</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {notAdmin ? (
            <Alert variant="destructive">
              <AlertTitle>Not an admin account</AlertTitle>
              <AlertDescription>
                Sign in with an admin account, or ask an existing admin to grant
                access.
              </AlertDescription>
            </Alert>
          ) : invalidInvite ? (
            <Alert variant="destructive">
              <AlertTitle>Invite link expired</AlertTitle>
              <AlertDescription>
                That invitation link is no longer valid. Ask an admin to send a
                fresh invite.
              </AlertDescription>
            </Alert>
          ) : null}

          <LoginForm />
        </CardContent>
      </Card>
    </main>
  )
}
