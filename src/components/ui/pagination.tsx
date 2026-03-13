import { type ComponentProps } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Pagination ---
export function Pagination({ className, ...props }: ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="ページネーション"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

// --- PaginationContent ---
export function PaginationContent({
  className,
  ...props
}: ComponentProps<"ul">) {
  return (
    <ul
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

// --- PaginationItem ---
export function PaginationItem({
  className,
  ...props
}: ComponentProps<"li">) {
  return <li className={cn("", className)} {...props} />;
}

// --- PaginationLink ---
type PaginationLinkProps = ComponentProps<"button"> & {
  isActive?: boolean;
};

export function PaginationLink({
  className,
  isActive,
  ...props
}: PaginationLinkProps) {
  return (
    <button
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-sm font-medium transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        isActive && "bg-primary text-primary-foreground",
        className
      )}
      {...props}
    />
  );
}

// --- PaginationPrevious ---
export function PaginationPrevious({
  className,
  ...props
}: ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="前のページへ"
      className={cn("w-auto gap-1 px-2.5", className)}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>前へ</span>
    </PaginationLink>
  );
}

// --- PaginationNext ---
export function PaginationNext({
  className,
  ...props
}: ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="次のページへ"
      className={cn("w-auto gap-1 px-2.5", className)}
      {...props}
    >
      <span>次へ</span>
      <ChevronRight className="h-4 w-4" />
    </PaginationLink>
  );
}

// --- PaginationEllipsis ---
export function PaginationEllipsis({
  className,
  ...props
}: ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-9 w-9 items-center justify-center",
        className
      )}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">その他のページ</span>
    </span>
  );
}
