import { Loader2Icon } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <Loader2Icon
        aria-label="Loading"
        className="size-8 animate-spin text-muted-foreground"
      />
    </div>
  )
}
