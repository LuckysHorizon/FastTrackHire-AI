import * as React from "react"
import { cn } from "../../lib/utils"

const Button = React.forwardRef(({ className, variant = "primary", size = "default", ...props }, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-sans tracking-[0.01em] transition-all duration-[200ms] ease-out-quart disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
  
  const variants = {
    primary: "bg-accent text-text-inverse hover:bg-accent-hover hover:-translate-y-[1px] hover:shadow-md active:translate-y-0",
    secondary: "bg-transparent border-[1.5px] border-bg-muted text-text-primary hover:border-accent hover:bg-accent-light",
    ghost: "bg-transparent border-none text-text-secondary hover:text-text-primary hover:bg-bg-subtle",
    danger: "bg-error text-white hover:bg-red-700 hover:-translate-y-[1px] hover:shadow-md active:translate-y-0"
  }
  
  const sizes = {
    default: "h-[44px] px-[24px] text-[14px] font-medium rounded-md",
    lg: "h-[52px] px-[32px] text-[16px] font-medium rounded-full", // Hero button uses rounded-full
    icon: "h-[40px] w-[40px] rounded-md"
  }

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
