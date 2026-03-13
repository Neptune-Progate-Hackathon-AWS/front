import { CircleCheck, Info, TriangleAlert, OctagonAlert } from "lucide-react";
import { type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// --- Variant styles (Toast と統一) ---

type AlertVariant = "default" | "success" | "info" | "warning" | "error";

const variantClasses: Record<AlertVariant, string> = {
  default: "border-border bg-background text-foreground",
  success:
    "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900 dark:text-emerald-100",
  info: "border-blue-300 bg-blue-100 text-blue-800 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-100",
  warning:
    "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-700 dark:bg-amber-900 dark:text-amber-100",
  error:
    "border-red-300 bg-red-100 text-red-800 dark:border-red-700 dark:bg-red-900 dark:text-red-100",
};

const variantIcons: Record<AlertVariant, ReactNode> = {
  default: null,
  success: (
    <CircleCheck size={16} className="text-emerald-600 dark:text-emerald-100" />
  ),
  info: <Info size={16} className="text-blue-600 dark:text-blue-100" />,
  warning: (
    <TriangleAlert size={16} className="text-amber-600 dark:text-amber-100" />
  ),
  error: <OctagonAlert size={16} className="text-red-600 dark:text-red-100" />,
};

// --- Alert ---
export function Alert({
  variant = "default",
  className,
  children,
  ...props
}: ComponentProps<"div"> & {
  variant?: AlertVariant;
}) {
  const icon = variantIcons[variant];
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border p-4",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      <div className={cn("flex gap-3", icon && "items-start")}>
        {icon && <span className="shrink-0">{icon}</span>}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

// --- AlertTitle ---
export function AlertTitle({
  className,
  children,
  ...props
}: ComponentProps<"h5">) {
  return (
    <h5 className={cn("font-medium leading-4", className)} {...props}>
      {children}
    </h5>
  );
}

// --- AlertDescription ---
export function AlertDescription({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div className={cn("mt-2 text-sm opacity-80", className)} {...props}>
      {children}
    </div>
  );
}
