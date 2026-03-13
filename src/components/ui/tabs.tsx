"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { createContext, use, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

// --- Variant Context ---
type TabsVariant = "underline" | "pill";
const TabsVariantContext = createContext<TabsVariant>("underline");

// --- Tabs Root ---
export function Tabs({
  className,
  children,
  ...props
}: ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root className={cn("w-full", className)} {...props}>
      {children}
    </TabsPrimitive.Root>
  );
}

// --- Tabs List ---
export function TabsList({
  variant = "underline",
  className,
  children,
  ...props
}: ComponentProps<typeof TabsPrimitive.List> & {
  variant?: TabsVariant;
}) {
  return (
    <TabsVariantContext value={variant}>
      <TabsPrimitive.List
        className={cn(
          "inline-flex items-center",
          variant === "underline" && "gap-1 border-b border-border",
          variant === "pill" && "gap-1 rounded-lg bg-muted p-1",
          className
        )}
        {...props}
      >
        {children}
      </TabsPrimitive.List>
    </TabsVariantContext>
  );
}

// --- Tabs Trigger ---
const triggerVariantStyles: Record<TabsVariant, string> = {
  underline:
    "rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground",
  pill: "rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
};

export function TabsTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  const variant = use(TabsVariantContext);
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        triggerVariantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

// --- Tabs Content ---
export function TabsContent({
  className,
  children,
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn("mt-4 focus-visible:outline-none", className)}
      {...props}
    >
      {children}
    </TabsPrimitive.Content>
  );
}
