"use client";

import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Progress({
  value = 0,
  className,
  ...props
}: ComponentProps<"div"> & {
  value?: number;
}) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...props}
    >
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
