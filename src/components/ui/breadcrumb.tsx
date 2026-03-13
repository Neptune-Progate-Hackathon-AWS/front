import { ChevronRight } from "lucide-react";
import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

// --- Breadcrumb ---
export function Breadcrumb({
  className,
  children,
  ...props
}: ComponentProps<"nav">) {
  return (
    <nav aria-label="パンくずリスト" className={className} {...props}>
      {children}
    </nav>
  );
}

// --- BreadcrumbList ---
export function BreadcrumbList({
  className,
  children,
  ...props
}: ComponentProps<"ol">) {
  return (
    <ol
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </ol>
  );
}

// --- BreadcrumbItem ---
export function BreadcrumbItem({
  className,
  children,
  ...props
}: ComponentProps<"li">) {
  return (
    <li
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    >
      {children}
    </li>
  );
}

// --- BreadcrumbLink ---
export function BreadcrumbLink({
  className,
  children,
  ...props
}: ComponentProps<"a">) {
  return (
    <a
      className={cn("transition-colors hover:text-foreground", className)}
      {...props}
    >
      {children}
    </a>
  );
}

// --- BreadcrumbPage ---
export function BreadcrumbPage({
  className,
  children,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      role="link"
      aria-current="page"
      aria-disabled="true"
      className={cn("font-medium text-foreground", className)}
      {...props}
    >
      {children}
    </span>
  );
}

// --- BreadcrumbSeparator ---
export function BreadcrumbSeparator({
  className,
  children,
  ...props
}: ComponentProps<"li">) {
  return (
    <li
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:h-3.5 [&>svg]:w-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}
