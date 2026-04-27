import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="flex max-w-sm flex-col items-center gap-6 text-center">
        <Image
          src="/crest.png"
          alt=""
          width={88}
          height={58}
          priority
          className="h-12 w-auto"
        />
        <div className="space-y-2">
          <p className="font-display text-7xl leading-none font-semibold text-gold">
            404
          </p>
          <h1 className="font-display text-2xl text-foreground">
            Page not found
          </h1>
          <p className="text-sm text-muted-foreground">
            The page you’re looking for doesn’t exist or has been moved.
          </p>
        </div>
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href="/dashboard" />}
        >
          Back to dashboard
        </Button>
      </div>
    </main>
  )
}
