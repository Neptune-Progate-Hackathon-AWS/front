"use client";

import { User } from "lucide-react";
import { type ComponentProps, useState } from "react";
import { cn } from "@/lib/utils";

// --- Size styles ---

type AvatarSize = "sm" | "md" | "lg";

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const iconSizes: Record<AvatarSize, number> = {
  sm: 14,
  md: 18,
  lg: 22,
};

// --- Avatar ---
export function Avatar({
  size = "md",
  className,
  children,
  ...props
}: ComponentProps<"div"> & {
  size?: AvatarSize;
}) {
  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted",
        sizeClasses[size],
        className
      )}
      data-size={size}
      {...props}
    >
      {children ?? <User size={iconSizes[size]} className="text-muted-foreground" />}
    </div>
  );
}

// --- AvatarImage ---
export function AvatarImage({
  className,
  onError,
  ...props
}: ComponentProps<"img">) {
  const [hasError, setHasError] = useState(false);

  if (hasError) return null;

  return (
    <img
      className={cn("h-full w-full object-cover", className)}
      onError={(e) => {
        setHasError(true);
        onError?.(e);
      }}
      {...props}
    />
  );
}

// --- AvatarFallback ---
export function AvatarFallback({
  className,
  children,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "absolute inset-0 flex items-center justify-center text-sm font-medium text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
