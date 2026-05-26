import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DotsThreeVertical,
  UserCircle,
  Gear,
  Bell,
  SignOut
} from "@phosphor-icons/react"
import { useNavigate } from "react-router-dom"

interface NavUserProps {
  user: {
    name: string
    email: string
    avatar?: string
    role?: string
  }
  onLogout?: () => void
}

export function NavUser({
  user,
  onLogout
}: NavUserProps) {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="h-14 data-[state=open]:bg-surface-highest/60 rounded-xl transition-all"
            >
              <Avatar className="h-9 w-9 rounded-xl border-2 border-white shadow-sm">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-xl bg-sungold text-presently-black font-bold">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                <span className="truncate font-bold text-on-surface">{user.name}</span>
                <span className="truncate text-[9px] uppercase tracking-widest text-on-surface-variant font-bold opacity-60">
                  {user.role?.replace('_', ' ') || 'Member'}
                </span>
              </div>
              <DotsThreeVertical size={20} weight="bold" className="ml-auto text-on-surface-variant/40" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 rounded-2xl border-outline/30 shadow-premium p-2"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={12}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-3 px-3 py-3 text-left">
                <Avatar className="h-10 w-10 rounded-xl">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-xl bg-sungold text-presently-black font-bold">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-on-surface">{user.name}</span>
                  <span className="truncate text-xs text-on-surface-variant font-medium">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-outline/10 my-2" />
            <DropdownMenuGroup className="space-y-1">
              <DropdownMenuItem
                className="rounded-xl px-4 py-3 focus:bg-surface-highest/60 cursor-pointer transition-colors"
                onClick={() => navigate('/dashboard/profile')}
              >
                <UserCircle size={18} weight="bold" className="mr-3 text-on-surface-variant" />
                <span className="font-bold text-sm">Personal Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl px-4 py-3 focus:bg-surface-highest/60 cursor-pointer transition-colors">
                <Bell size={18} weight="bold" className="mr-3 text-on-surface-variant" />
                <span className="font-bold text-sm">Notifications</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-xl px-4 py-3 focus:bg-surface-highest/60 cursor-pointer transition-colors"
                onClick={() => navigate('/dashboard/settings')}
              >
                <Gear size={18} weight="bold" className="mr-3 text-on-surface-variant" />
                <span className="font-bold text-sm">Preferences</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-outline/10 my-2" />
            <DropdownMenuItem
              className="rounded-xl px-4 py-3 text-soft-coral focus:text-white focus:bg-soft-coral cursor-pointer transition-all font-bold text-sm"
              onClick={onLogout}
            >
              <SignOut size={18} weight="bold" className="mr-3" />
              Log out session
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
