import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-2 text-base transition-all duration-200 outline-none",
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "placeholder:text-muted-foreground",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:shadow-[inset_3px_0_0_0_var(--destructive),inset_0_-3px_0_0_var(--destructive)]",
        "focus:border-transparent focus:shadow-[inset_3px_0_0_0_var(--primary),inset_0_-3px_0_0_var(--primary)]",
        "focus-visible:outline-none focus-visible:border-transparent focus-visible:shadow-[inset_3px_0_0_0_var(--primary),inset_0_-3px_0_0_var(--primary)]",
        "md:text-sm dark:bg-input/30 dark:disabled:bg-input/80",
        className
      )}
      {...props}
    />
  )
}

export { Input }