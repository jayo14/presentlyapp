import { Bell } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { SearchExpand } from "../../components/Dashboard/SearchExpand"
import { ThemeToggle } from "../../components/ThemeToggle"
import { useCurrentUser } from "../../hooks/useAuth"

interface SiteHeaderProps {
  title: string
  description?: string
}

export function SiteHeader({ title, description }: SiteHeaderProps) {
  const { data: currentUser } = useCurrentUser()

  return (
    <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center gap-2 bg-surface/60 backdrop-blur-lg border-b border-outline/30 transition-all duration-500 ease-premium">
      <div className="flex w-full items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="-ml-1 text-on-surface-variant hover:bg-surface-highest rounded-xl" />
          <Separator
            orientation="vertical"
            className="mx-2 h-4 bg-outline/50"
          />
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-on-surface truncate tracking-tight">{title}</h1>
            {description && (
              <p className="text-xs text-on-surface-variant font-medium truncate">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <SearchExpand />

          <div className="hidden sm:flex items-center gap-2">
            <ThemeToggle />
            <button
              aria-label="View notifications"
              className="p-2.5 hover:bg-surface-highest rounded-full transition-colors relative group"
            >
              <Bell size={18} className="text-on-surface-variant group-hover:text-on-surface transition-colors" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-sungold rounded-full border-2 border-surface shadow-gold" />
            </button>
          </div>

          <div className="h-8 w-[1px] bg-outline/30 mx-1 hidden lg:block" />

          <div className="flex items-center gap-4 pl-2">
            <div className="text-right hidden lg:block">
              <p className="text-sm font-bold text-on-surface leading-none mb-1">
                {currentUser?.full_name?.split(' ')[0] || 'User'}
              </p>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.15em] opacity-60">
                {currentUser?.role?.replace('_', ' ') || 'Guest'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-outline/50 bg-primary/10 flex-shrink-0 transition-transform hover:scale-105 duration-300">
              {currentUser?.avatar_url ? (
                <img src={currentUser.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-sungold">
                  {currentUser?.full_name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
