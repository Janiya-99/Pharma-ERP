import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-blue-500 text-white border border-transparent shadow-sm dark:bg-blue-600 [a]:hover:bg-blue-600 dark:[a]:hover:bg-blue-700",
        secondary:
          "bg-purple-500 text-white border border-transparent shadow-sm dark:bg-purple-600 [a]:hover:bg-purple-600 dark:[a]:hover:bg-purple-700",
        destructive:
          "bg-red-500 text-white border border-transparent shadow-sm dark:bg-red-600 focus-visible:ring-red-500/20 dark:focus-visible:ring-red-500/40 [a]:hover:bg-red-600 dark:[a]:hover:bg-red-700",
        success:
          "bg-green-500 text-white border border-transparent shadow-sm dark:bg-green-600 [a]:hover:bg-green-600 dark:[a]:hover:bg-green-700",
        warning:
          "bg-orange-500 text-white border border-transparent shadow-sm dark:bg-orange-600 [a]:hover:bg-orange-600 dark:[a]:hover:bg-orange-700",
        outline:
          "border border-border text-foreground shadow-sm bg-background [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50 text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
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
