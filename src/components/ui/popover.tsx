"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

// --- Popover Root ---
export function Popover({
  children,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root {...props}>{children}</PopoverPrimitive.Root>;
}

// --- Popover Trigger ---
export function PopoverTrigger({
  children,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return (
    <PopoverPrimitive.Trigger {...props}>{children}</PopoverPrimitive.Trigger>
  );
}

// --- Popover Content ---
export function PopoverContent({
  className,
  children,
  sideOffset = 4,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-72 rounded-xl border border-border bg-background p-4 shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 duration-200",
          className
        )}
        {...props}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}
