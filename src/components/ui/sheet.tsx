"use client";

import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

// --- Sheet Root ---
export function Sheet({
  children,
  ...props
}: ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root {...props}>{children}</SheetPrimitive.Root>;
}

// --- Sheet Trigger ---
export function SheetTrigger({
  children,
  ...props
}: ComponentProps<typeof SheetPrimitive.Trigger>) {
  return (
    <SheetPrimitive.Trigger {...props}>{children}</SheetPrimitive.Trigger>
  );
}

// --- Sheet Close ---
export function SheetClose({
  children,
  ...props
}: ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close {...props}>{children}</SheetPrimitive.Close>;
}

// --- Sheet Content (Portal + Overlay + Content + Close button) ---
const sideStyles = {
  top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
  bottom:
    "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
  left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
  right:
    "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
} as const;

type Side = keyof typeof sideStyles;

export function SheetContent({
  side = "right",
  className,
  children,
  ...props
}: ComponentProps<typeof SheetPrimitive.Content> & { side?: Side }) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200" />
      <SheetPrimitive.Content
        className={cn(
          "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:animate-in data-[state=open]:duration-300",
          sideStyles[side],
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none">
          <X size={16} />
          <span className="sr-only">閉じる</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

// --- Sheet Header (layout div) ---
export function SheetHeader({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)} {...props}>
      {children}
    </div>
  );
}

// --- Sheet Title ---
export function SheetTitle({
  className,
  children,
  ...props
}: ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      className={cn("text-lg font-semibold", className)}
      {...props}
    >
      {children}
    </SheetPrimitive.Title>
  );
}

// --- Sheet Description ---
export function SheetDescription({
  className,
  children,
  ...props
}: ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </SheetPrimitive.Description>
  );
}

// --- Sheet Footer (layout div) ---
export function SheetFooter({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div className={cn("mt-6 flex justify-end gap-2", className)} {...props}>
      {children}
    </div>
  );
}
