"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

// --- Dialog Root ---
export function Dialog({
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root {...props}>{children}</DialogPrimitive.Root>;
}

// --- Dialog Trigger ---
export function DialogTrigger({
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Trigger>) {
  return (
    <DialogPrimitive.Trigger {...props}>{children}</DialogPrimitive.Trigger>
  );
}

// --- Dialog Content (Portal + Overlay + Content + Close button) ---
export function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-background p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-6 top-7 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <X size={16} />
          <span className="sr-only">閉じる</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

// --- Dialog Header (layout div) ---
export function DialogHeader({
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

// --- Dialog Title ---
export function DialogTitle({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-lg font-semibold", className)}
      {...props}
    >
      {children}
    </DialogPrimitive.Title>
  );
}

// --- Dialog Description ---
export function DialogDescription({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-sm text-muted-foreground my-4", className)}
      {...props}
    >
      {children}
    </DialogPrimitive.Description>
  );
}

// --- Dialog Footer (layout div) ---
export function DialogFooter({
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

// --- Dialog Close ---
export function DialogClose({
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close {...props}>{children}</DialogPrimitive.Close>;
}
