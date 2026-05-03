import * as React from "react"
import { Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface LocalSearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  showIcon?: boolean;
}

const LocalSearchInput = React.forwardRef<HTMLInputElement, LocalSearchInputProps>(
  ({ className, onClear, showIcon = true, ...props }, ref) => {
    const hasValue = !!props.value;

    return (
      <div className="relative group w-full max-w-sm">
        {showIcon && (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
        )}
        <Input
          ref={ref}
          className={cn(
            "pr-9 transition-all bg-background/50 backdrop-blur-sm border-border h-10 focus-visible:ring-primary/20",
            showIcon ? "pl-9" : "pl-3",
            className
          )}
          {...props}
        />
        {hasValue && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted p-0.5"
          >
            <X className="h-full w-full" />
          </button>
        )}
      </div>
    )
  }
)
LocalSearchInput.displayName = "LocalSearchInput"

export { LocalSearchInput }
