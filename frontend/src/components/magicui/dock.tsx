import React from 'react'
import { cn } from '../ui/utils'

export type DockItemConfig = {
  id: string
  label: string
  icon: React.ReactNode
  active?: boolean
  onClick?: () => void
  isAccent?: boolean  // true = center FAB
}

interface DockProps {
  items: DockItemConfig[]
}

export const Dock: React.FC<DockProps> = ({ items }) => {
  if (!items.length) return null

  return (
    <div
      className={cn(
        'pointer-events-auto mx-auto flex h-16 items-center justify-around',
        'rounded-[2rem] border border-outline/20 bg-surface/95 backdrop-blur-2xl',
        'px-3 shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300',
        'max-w-[320px] w-[calc(100vw-48px)]'
      )}
    >
      {items.map((item) => {
        const isActive = !!item.active
        const isAccent = !!item.isAccent

        return (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            aria-label={item.label || 'Action'}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'relative flex flex-col items-center justify-center gap-0.5',
              'transition-all duration-200 active:scale-95',
              isAccent ? '-translate-y-3' : 'min-w-[52px]'
            )}
          >
            {/* Icon container */}
            <div
              className={cn(
                'flex items-center justify-center rounded-2xl transition-all duration-200',
                isAccent
                  ? 'h-14 w-14 bg-primary text-background shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:scale-105 active:scale-95'
                  : cn(
                      'h-9 w-9',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-textMuted hover:text-text hover:bg-surfaceHigh/60'
                    )
              )}
            >
              <span className={isAccent ? 'scale-110' : 'scale-100'}>
                {item.icon}
              </span>
            </div>

            {/* Label — hidden for accent FAB */}
            {!isAccent && (
              <span
                className={cn(
                  'text-[9px] font-bold uppercase tracking-[0.12em] transition-colors duration-200',
                  isActive ? 'text-primary' : 'text-textMuted'
                )}
              >
                {item.label}
              </span>
            )}

            {/* Active dot indicator */}
            {isActive && !isAccent && (
              <span className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-primary" />
            )}
          </button>
        )
      })}
    </div>
  )
}
