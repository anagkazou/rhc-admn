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

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
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
          ) : null}

          <LoginForm />
        </CardContent>
      </Card>
    </main>
  )
}
