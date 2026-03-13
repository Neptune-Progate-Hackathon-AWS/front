"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

// --- Select Root ---
type SelectProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
};

export function Select({
  value,
  onValueChange,
  disabled = false,
  children,
}: SelectProps) {
  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      {children}
    </SelectPrimitive.Root>
  );
}

// --- Select Trigger ---
type SelectTriggerSize = "sm" | "md" | "lg";

const triggerSizeStyles: Record<SelectTriggerSize, string> = {
  sm: "h-9 rounded-md",
  md: "h-10 rounded-lg",
  lg: "h-11 rounded-lg",
};

export function SelectTrigger({
  error,
  size = "md",
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Trigger> & {
  error?: boolean;
  size?: SelectTriggerSize;
}) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex w-full items-center justify-between border bg-background px-3.5 py-2 text-sm transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        triggerSizeStyles[size],
        error
          ? "border-destructive focus-visible:border-destructive"
          : "border-input focus-visible:border-foreground",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon render={<ChevronDown size={16} className="ml-2 shrink-0 opacity-50" />}></SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

// --- Select Value ---
export function SelectValue({
  placeholder,
  ...props
}: ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value placeholder={placeholder} {...props} />;
}

// --- Select Content ---
export function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position={position}
        className={cn(
          "z-50 overflow-hidden rounded-lg border border-border bg-background shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          position === "popper" && "translate-y-1",
          className
        )}
        {...props}
      >
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

// --- Select Item ---
export function SelectItem({
  value,
  disabled = false,
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      value={value}
      disabled={disabled}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check size={16} />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
