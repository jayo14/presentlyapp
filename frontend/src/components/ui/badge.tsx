import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../ui/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-4 py-1 text-[10px] font-bold uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-sungold/20",
  {
    variants: {
      variant: {
        default: "bg-sungold/10 border-sungold/20 text-sungold",
        secondary: "bg-surface-highest/40 border-outline/30 text-on-surface-variant",
        destructive: "bg-soft-coral/10 border-soft-coral/20 text-soft-coral",
        outline: "border-outline text-on-surface-variant",
        present: "bg-moss-green/10 border-moss-green/20 text-moss-green",
        absent: "bg-soft-coral/10 border-soft-coral/20 text-soft-coral",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
