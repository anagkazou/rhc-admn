'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HandshakeIcon,
  KeyRoundIcon,
  MailIcon,
  ShieldCheckIcon,
  UsersIcon,
} from 'lucide-react'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

type NavItem = {
  href: string
  label: string
  Icon: typeof MailIcon
}

const submissionItems: readonly NavItem[] = [
  { href: '/dashboard/player', label: 'Player ', Icon: MailIcon },
  { href: '/dashboard/partners', label: 'Partner ', Icon: HandshakeIcon },
] as const

const securityItems: readonly NavItem[] = [
  { href: '/dashboard/admins', label: 'Admins', Icon: UsersIcon },
  { href: '/dashboard/sessions', label: 'Sessions', Icon: KeyRoundIcon },
  { href: '/dashboard/security', label: 'Two-factor', Icon: ShieldCheckIcon },
] as const

export function DashboardSidebarNav() {
  const pathname = usePathname()

  return (
    <>
      <NavGroup label="Submissions" items={submissionItems} pathname={pathname} />
      <NavGroup label="Security" items={securityItems} pathname={pathname} />
    </>
  )
}

function NavGroup({
  label,
  items,
  pathname,
}: {
  label: string
  items: readonly NavItem[]
  pathname: string | null
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(({ href, label, Icon }) => {
            const isActive =
              pathname === href || pathname?.startsWith(`${href}/`)
            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  isActive={isActive}
                  className="data-active:text-gold"
                  render={<Link href={href} />}
                >
                  <Icon />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
