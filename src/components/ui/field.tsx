import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

// --- Field ---
export function Field({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("group/field grid gap-2", className)} {...props} />;
}

// --- FieldLabel ---
export function FieldLabel({
  className,
  ...props
}: ComponentProps<typeof Label>) {
  return (
    <Label
      className={cn(
        "group-data-[invalid=true]/field:text-destructive",
        className,
      )}
      {...props}
    />
  );
}

// --- FieldDescription ---
export function FieldDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p className={cn("text-ui text-muted-foreground", className)} {...props} />
  );
}

// --- FieldError ---
type FieldErrorProps = Omit<ComponentProps<"p">, "children"> & {
  errors?: ({ message?: string } | undefined)[];
};

export function FieldError({ errors, className, ...props }: FieldErrorProps) {
  const message = errors?.find((e) => e?.message)?.message;
  if (!message) return null;

  return (
    <p
      role="alert"
      className={cn("text-ui text-destructive", className)}
      {...props}
    >
      {message}
    </p>
  );
}

// --- FieldGroup ---
export function FieldGroup({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("grid gap-4", className)} {...props} />;
}

// --- FieldSet ---
export function FieldSet({ className, ...props }: ComponentProps<"fieldset">) {
  return <fieldset className={cn("grid gap-4", className)} {...props} />;
}

// --- FieldSeparator ---
export function FieldSeparator({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      role="separator"
      className={cn(
        "flex items-center gap-3 text-sm text-muted-foreground",
        className,
      )}
      {...props}
    >
      <div className="h-px flex-1 bg-border" />
      {children && <span className="shrink-0">{children}</span>}
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

// --- FieldLegend ---
export function FieldLegend({ className, ...props }: ComponentProps<"legend">) {
  return <legend className={cn("text-sm font-medium", className)} {...props} />;
}
