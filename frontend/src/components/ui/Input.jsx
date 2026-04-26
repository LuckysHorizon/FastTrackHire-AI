import * as React from "react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef(({ className, label, helperText, error, id, ...props }, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`
  const [isFocused, setIsFocused] = React.useState(false)
  const [hasValue, setHasValue] = React.useState(!!props.value || !!props.defaultValue)

  const handleFocus = (e) => {
    setIsFocused(true)
    if (props.onFocus) props.onFocus(e)
  }

  const handleBlur = (e) => {
    setIsFocused(false)
    setHasValue(!!e.target.value)
    if (props.onBlur) props.onBlur(e)
  }

  const handleChange = (e) => {
    setHasValue(!!e.target.value)
    if (props.onChange) props.onChange(e)
  }

  // Effect to sync hasValue with external value prop changes
  React.useEffect(() => {
    if (props.value !== undefined) {
      setHasValue(!!props.value)
    }
  }, [props.value])

  const isFloating = isFocused || hasValue

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          {...props}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          className={cn(
            "h-[48px] w-full bg-bg-surface border-[1.5px] rounded-md px-[16px]",
            label ? "pt-4 pb-1" : "py-0",
            "font-sans text-[15px] text-text-primary outline-none transition-all duration-150 ease-in-out",
            error 
              ? "border-error focus:ring-[3px] focus:ring-[rgba(192,57,43,0.08)]" 
              : "border-bg-muted focus:border-accent focus:ring-[3px] focus:ring-[rgba(26,26,46,0.08)]",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          placeholder={label ? "" : props.placeholder} 
        />
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "absolute left-[16px] top-1/2 -translate-y-1/2 font-sans transition-all duration-200 pointer-events-none text-text-secondary",
              isFloating ? "top-3 text-[11px] font-medium" : "text-[15px] font-normal"
            )}
          >
            {label}
          </label>
        )}
      </div>
      {(helperText || error) && (
        <p className={cn("mt-1 text-[12px] font-sans", error ? "text-error" : "text-text-tertiary")}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})
Input.displayName = "Input"

export { Input }
