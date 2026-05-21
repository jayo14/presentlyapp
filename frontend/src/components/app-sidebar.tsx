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
import { motion } from "framer-motion"

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
        <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] font-black text-on-surface-variant/50 px-4 mb-3">
          {label}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="gap-1.5">
            {items.map((item) => {
              const Icon = item.icon
              const active = location.pathname === item.href || (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
              return (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={active}
                    onClick={() => navigate(item.href)}
                    className={cn(
                      "flex items-center gap-3.5 px-4 py-6 rounded-2xl transition-all duration-500 ease-premium font-bold border border-transparent",
                      active
                        ? "bg-sungold text-presently-black shadow-gold border-sungold/50 hover:bg-sungold hover:text-presently-black scale-[1.02]"
                        : "text-on-surface-variant/80 hover:bg-surface-highest/80 hover:text-on-surface hover:border-outline/30 hover:translate-x-1"
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center rounded-xl transition-all duration-500",
                      active ? "text-presently-black" : "text-on-surface-variant group-hover:scale-110"
                    )}>
                      <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                    </div>
                    <span className="text-[13px] tracking-tight">{item.label}</span>
                    {active && (
                      <motion.div
                        layoutId="active-indicator"
                        className="absolute right-3 w-1.5 h-1.5 rounded-full bg-presently-black"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
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
    <Sidebar collapsible="offcanvas" className="border-r border-outline/40 bg-surface selection:bg-sungold/30" {...props}>
      <SidebarHeader className="p-8 pb-4">
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
