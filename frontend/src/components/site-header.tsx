import { Bell } from "@phosphor-icons/react"
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
    <header className="sticky top-0 z-30 flex h-[80px] shrink-0 items-center gap-2 bg-surface/60 backdrop-blur-lg border-b border-outline/30 transition-all duration-500 ease-premium">
      <div className="flex w-full items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <SidebarTrigger
            aria-label="Toggle sidebar"
            className="-ml-1 text-on-surface-variant hover:bg-surface-highest/60 hover:text-on-surface rounded-xl transition-all"
          />
          <Separator
            orientation="vertical"
            className="mx-2 h-6 bg-outline/40"
          />
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-on-surface truncate tracking-tight font-display">{title}</h1>
            {description && (
              <p className="text-[10px] text-on-surface-variant font-bold truncate uppercase tracking-widest opacity-60">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <SearchExpand />

          <div className="hidden sm:flex items-center gap-2">
            <ThemeToggle />
            <button
              aria-label="View notifications"
              className="p-3 hover:bg-surface-highest/60 rounded-xl transition-all relative group"
            >
              <Bell size={20} weight="bold" className="text-on-surface-variant group-hover:text-on-surface transition-colors" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-sungold rounded-full border-2 border-surface shadow-gold" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
