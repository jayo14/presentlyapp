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
    <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center gap-2 bg-surface/40 backdrop-blur-md border-b border-outline/50 transition-[width,height] ease-linear">
      <div className="flex w-full items-center justify-between px-6">
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
            <button className="p-2.5 hover:bg-surface-highest rounded-full transition-colors relative group">
              <Bell size={18} className="text-on-surface-variant group-hover:text-on-surface transition-colors" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-sungold rounded-full border-2 border-surface shadow-gold" />
            </button>
          </div>

          <div className="h-8 w-[1px] bg-outline/30 mx-1 hidden lg:block" />

          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden lg:block">
              <p className="text-xs font-bold text-on-surface">
                {currentUser?.full_name?.split(' ')[0] || 'User'}
              </p>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                {currentUser?.role?.replace('_', ' ') || 'Guest'}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-outline bg-primary/10 flex-shrink-0">
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
