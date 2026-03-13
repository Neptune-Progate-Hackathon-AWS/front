import { cloneElement, isValidElement, type ComponentProps, type ReactElement } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "destructive";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  outline:
    "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm rounded-md",
  md: "h-10 px-5 min-w-[80px] text-sm rounded-lg",
  lg: "h-11 px-5 min-w-[80px] text-sm rounded-lg",
};

const baseStyles =
  "cursor-pointer inline-flex items-center justify-center font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

export function Button({
  variant = "primary",
  size = "md",
  asChild,
  className,
  children,
  ...props
}: ButtonProps) {
  const styles = cn(baseStyles, variantStyles[variant], sizeStyles[size], className);

  if (asChild && isValidElement(children)) {
    return cloneElement(children as ReactElement<Record<string, unknown>>, {
      className: cn(styles, (children.props as { className?: string }).className),
    });
  }

  return (
    <button className={styles} {...props}>
      {children}
    </button>
  );
}
