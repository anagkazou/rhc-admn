'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HandshakeIcon, MailIcon } from 'lucide-react'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const items = [
  {
    href: '/dashboard/player',
    label: 'Player ',
    Icon: MailIcon,
  },
  {
    href: '/dashboard/partners',
    label: 'Partner ',
    Icon: HandshakeIcon,
  },
] as const

export function DashboardSidebarNav() {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Submissions</SidebarGroupLabel>
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
