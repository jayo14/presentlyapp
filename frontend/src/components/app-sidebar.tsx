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
      <SidebarGroup>
        <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/70 px-4 mb-2">
          {label}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="px-2 gap-1">
            {items.map((item) => {
              const Icon = item.icon
              const active = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={active}
                    onClick={() => navigate(item.href)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ease-premium font-bold",
                      active
                        ? "bg-sungold text-presently-black shadow-gold hover:bg-sungold hover:text-presently-black"
                        : "text-on-surface-variant hover:bg-surface-highest hover:text-on-surface"
                    )}
                  >
                    <Icon size={20} className={cn("shrink-0", active ? "text-presently-black" : "group-hover:scale-110 transition-transform")} />
                    <span className="text-sm tracking-tight">{item.label}</span>
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
    <Sidebar collapsible="offcanvas" className="border-r border-outline/50 bg-surface" {...props}>
      <SidebarHeader className="p-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-transparent focus:bg-transparent"
              onClick={() => navigate('/dashboard')}
            >
              <Logo showText={true} />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-6 py-4">
        {renderNavGroup("Core", coreItems)}
        {renderNavGroup("Management", managementItems)}
        {renderNavGroup("System", systemItems)}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-outline/30">
        {currentUser && (
          <NavUser
            user={{
              name: currentUser.full_name || "User",
              email: currentUser.email || "",
              avatar: currentUser.avatar_url,
              role: currentUser.role
            }}
            onLogout={onLogout || (() => {})}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
