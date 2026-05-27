import * as React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Logo } from "../../components/Logo"
import { getNavItemsForRole, NavItem } from "../../utils/navigation"
import { useCurrentUser } from "../../hooks/useAuth"
import { cn } from "@/components/ui/utils"

export function AppSidebar({ onLogout, ...props }: React.ComponentProps<typeof Sidebar> & { onLogout?: () => void }) {
  const { data: currentUser } = useCurrentUser()
  const navigate = useNavigate()
  const location = useLocation()

  const role = currentUser?.role?.toLowerCase() || "student"
  const navItems = getNavItemsForRole(role)

  const coreItems = navItems.filter(item => item.section === 'core')
  const managementItems = navItems.filter(item => item.section === 'management')
  const systemItems = navItems.filter(item => item.section === 'system')

  const renderNavGroup = (label: string, items: NavItem[]) => {
    if (items.length === 0) return null
    return (
      <SidebarGroup className="px-3">
        <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant/40 px-4 mb-4">
          {label}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="gap-2">
            {items.map((item) => {
              const Icon = item.icon
              const active = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={active}
                    onClick={() => navigate(item.href)}
                    className={cn(
                      "h-12 px-4 rounded-xl transition-all duration-300",
                      active
                        ? "bg-sungold text-presently-black shadow-gold font-bold"
                        : "text-on-surface-variant hover:bg-surface-highest/40 hover:translate-x-1"
                    )}
                  >
                    <Icon size={20} weight={active ? "bold" : "regular"} className={active ? "text-presently-black" : "text-on-surface-variant"} />
                    <span className="text-sm">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    )
  }

  return (
    <Sidebar variant="inset" className="border-r-0 bg-background" {...props}>
      <SidebarHeader className="h-[80px] flex items-center px-8 border-b border-outline/10">
        <Logo showText={true} />
      </SidebarHeader>
      <SidebarContent className="py-8 gap-10">
        {renderNavGroup("General", coreItems)}
        {renderNavGroup("Management", managementItems)}
        {renderNavGroup("Infrastructure", systemItems)}
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-outline/10">
        <NavUser
          user={{
            name: currentUser?.full_name || "User",
            email: currentUser?.email || "",
            avatar: "",
            role: currentUser?.role
          }}
          onLogout={onLogout}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
