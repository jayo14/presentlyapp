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
  DotsThreeVerticalIcon,
  UserCircleIcon,
  CreditCardIcon,
  BellIcon,
  SignOutIcon
} from "@phosphor-icons/react"
import { useNavigate } from "react-router-dom"

interface NavUserProps {
  user: {
    name: string
    email: string
    avatar?: string
    role?: string
  }
  onLogout: () => void
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
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-sungold text-presently-black font-bold">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold text-on-surface">{user.name}</span>
                <span className="truncate text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                  {user.role?.replace('_', ' ')}
                </span>
              </div>
              <DotsThreeVerticalIcon className="ml-auto size-4 text-on-surface-variant" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl border-outline shadow-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-sungold text-presently-black font-bold">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-on-surface">{user.name}</span>
                  <span className="truncate text-xs text-on-surface-variant">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-outline/50" />
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="rounded-lg focus:bg-surface-highest cursor-pointer"
                onClick={() => navigate('/dashboard/profile')}
              >
                <UserCircleIcon className="size-4 mr-2" />
                <span className="font-bold">Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg focus:bg-surface-highest cursor-pointer">
                <BellIcon className="size-4 mr-2" />
                <span className="font-bold">Notifications</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="rounded-lg focus:bg-surface-highest cursor-pointer"
                onClick={() => navigate('/dashboard/settings')}
              >
                <CreditCardIcon className="size-4 mr-2" />
                <span className="font-bold">Settings</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-outline/50" />
            <DropdownMenuItem
              className="rounded-lg text-error focus:text-error focus:bg-error/10 cursor-pointer"
              onClick={onLogout}
            >
              <SignOutIcon className="size-4 mr-2" />
              <span className="font-bold">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
