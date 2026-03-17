import * as React from "react"

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactElement
  disabled?: boolean
  showArrow?: boolean
}

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip({ content, children, disabled }, ref) {
    if (disabled) return children

    return (
      <div ref={ref} className="relative group inline-flex">
        {children}
        <div
          role="tooltip"
          className={[
            "pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50",
            "rounded-md bg-foreground px-2 py-1 text-xs text-background whitespace-nowrap",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
          ].join(" ")}
        >
          {content}
        </div>
      </div>
    )
  }
)

