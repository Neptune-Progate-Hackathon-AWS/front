import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "outline";
type BadgeSize = "sm" | "md";

type BadgeProps = ComponentProps<"span"> & {
  variant?: BadgeVariant;
  size?: BadgeSize;
};

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-primary text-primary-foreground",
  outline: "border border-border text-foreground",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "text-xs px-2 py-0.5 rounded-md",
  md: "text-sm px-3 py-1 rounded-md",
};

export function Badge({
  variant = "default",
  size = "md",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center font-medium", variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {children}
    </span>
  );
}
