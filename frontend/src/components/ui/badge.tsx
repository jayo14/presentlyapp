import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "./utils"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap transition-all",
  {
    variants: {
      variant: {
        default: "bg-sungold/10 text-presently-black",
        present: "bg-[#D1FAE5] text-[#065F46]",
        absent: "bg-[#FEE2E2] text-[#991B1B]",
        late: "bg-[#FEF3C7] text-[#92400E]",
        excused: "bg-[#EFF6FF] text-[#1E40AF]",
        secondary: "bg-presently-black/10 text-presently-black",
        outline: "border-outline text-on-surface-variant",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
