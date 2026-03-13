"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

// --- DropdownMenu Root ---
export function DropdownMenu({
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return (
    <DropdownMenuPrimitive.Root {...props}>
      {children}
    </DropdownMenuPrimitive.Root>
  );
}

// --- DropdownMenu Trigger ---
export function DropdownMenuTrigger({
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return (
    <DropdownMenuPrimitive.Trigger {...props}>
      {children}
    </DropdownMenuPrimitive.Trigger>
  );
}

// --- DropdownMenu Content ---
export function DropdownMenuContent({
  sideOffset = 4,
  className,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-background p-1 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      >
        {children}
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
}

// --- DropdownMenu Item ---
export function DropdownMenuItem({
  destructive = false,
  className,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  destructive?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        destructive && "text-destructive focus:bg-destructive/10 focus:text-destructive",
        className
      )}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.Item>
  );
}

// --- DropdownMenu Label ---
export function DropdownMenuLabel({
  className,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return (
    <DropdownMenuPrimitive.Label
      className={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground", className)}
      {...props}
    >
      {children}
    </DropdownMenuPrimitive.Label>
  );
}

// --- DropdownMenu Separator ---
export function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

// --- DropdownMenu Shortcut ---
export function DropdownMenuShortcut({
  className,
  children,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      className={cn("ml-auto text-xs text-muted-foreground", className)}
      {...props}
    >
      {children}
    </span>
  );
}
