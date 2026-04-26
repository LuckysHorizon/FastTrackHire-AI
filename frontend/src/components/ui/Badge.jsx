import * as React from "react"
import { cn } from "../../lib/utils"

function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "bg-bg-muted text-text-primary",
    success: "bg-success-light text-success",
    warning: "bg-warning-light text-warning",
    error: "bg-error-light text-error",
    info: "bg-info-light text-info",
    accent: "bg-accent text-text-inverse"
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold font-sans transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
