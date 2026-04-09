import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-gray-300 bg-gray-200 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[size=default]:h-[20px] data-[size=default]:w-[36px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] data-[state=unchecked]:bg-gray-300/50 data-[state=unchecked]:border-transparent data-disabled:cursor-not-allowed data-disabled:opacity-50 dark:border-white/20 dark:bg-white/10 dark:data-[state=checked]:bg-primary dark:data-[state=unchecked]:bg-white/5",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-sm ring-0 transition-all duration-300 ease-in-out",
          "group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3",
          "group-data-[state=checked]/switch:translate-x-[16px] group-data-[state=unchecked]/switch:translate-x-[2px]",
          "group-data-[size=sm]/switch:group-data-[state=checked]/switch:translate-x-[10px] group-data-[size=sm]/switch:group-data-[state=unchecked]/switch:translate-x-[2px]"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
