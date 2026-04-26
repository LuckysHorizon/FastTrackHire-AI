import * as React from "react"
import { cn } from "../../lib/utils"

const Card = React.forwardRef(({ className, variant = "base", ...props }, ref) => {
  const variants = {
    base: "bg-bg-surface border border-bg-muted rounded-xl shadow-xs",
    elevated: "bg-bg-surface border border-bg-muted rounded-xl shadow-md transition-all duration-[240ms] ease-out-quart hover:shadow-lg hover:-translate-y-[2px]",
    glass: "bg-[rgba(255,255,255,0.72)] backdrop-blur-[20px] backdrop-saturate-[1.4] border border-[rgba(255,255,255,0.6)] rounded-xl shadow-sm"
  }

  return (
    <div
      ref={ref}
      className={cn(variants[variant], "p-[24px]", className)}
      {...props}
    />
  )
})
Card.displayName = "Card"

export { Card }
