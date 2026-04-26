import * as React from "react"
import { cn } from "../../lib/utils"

const Avatar = React.forwardRef(({ className, src, fallback, size = "md", ...props }, ref) => {
  const [error, setError] = React.useState(false)

  const sizes = {
    sm: "h-[32px] w-[32px] text-[12px]",
    md: "h-[40px] w-[40px] text-[14px]",
    lg: "h-[56px] w-[56px] text-[18px]",
    xl: "h-[80px] w-[80px] text-[24px]"
  }

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full bg-accent text-text-inverse items-center justify-center font-sans font-medium",
        sizes[size],
        className
      )}
      {...props}
    >
      {src && !error ? (
        <img
          src={src}
          alt="Avatar"
          className="aspect-square h-full w-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        <span>{fallback}</span>
      )}
    </div>
  )
})
Avatar.displayName = "Avatar"

export { Avatar }
