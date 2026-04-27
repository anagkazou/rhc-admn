import Image from 'next/image'
import { cookies } from 'next/headers'
import { LogOutIcon } from 'lucide-react'
import { requireAdmin } from '@/lib/dal'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { DashboardSidebarNav } from './sidebar-nav'
import { logout } from './actions'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await requireAdmin()
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false'

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
            <Image
              src="/crest.png"
              alt=""
              width={55}
              height={36}
              priority
              className="h-7 w-auto shrink-0 group-data-[collapsible=icon]:h-5"
            />
            <div className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
              <span className="font-display text-base font-semibold text-gold">
                Roll High Club
              </span>
              <span className="text-[11px] tracking-wider text-muted-foreground uppercase">
                Admin
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <DashboardSidebarNav />
        </SidebarContent>

        <SidebarFooter>
          <div className="flex flex-col gap-2 px-2 pb-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-xs text-muted-foreground">
              {admin.authEmail}
            </p>
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <LogOutIcon className="size-4" />
                Sign out
              </button>
            </form>
          </div>
          <form
            action={logout}
            className="hidden group-data-[collapsible=icon]:flex"
          >
            <button
              type="submit"
              aria-label="Sign out"
              title="Sign out"
              className="flex size-8 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOutIcon className="size-4" />
            </button>
          </form>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background px-4 sm:px-6">
          <SidebarTrigger className="-ml-2" />
          <Separator orientation="vertical" className="h-5" />
          <span className="font-display text-base text-gold">
            Roll High Club <span className="text-muted-foreground">Admin</span>
          </span>
        </header>

        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
