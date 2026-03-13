import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

type TextareaSize = "md" | "lg";

type TextareaProps = Omit<ComponentProps<"textarea">, "size"> & {
  error?: boolean;
  size?: TextareaSize;
};

const sizeStyles: Record<TextareaSize, string> = {
  md: "px-3.5 py-2",
  lg: "px-4 py-2.5",
};

export function Textarea({
  error,
  size = "md",
  className,
  ...props
}: TextareaProps) {
  return (
    <textarea
      className={cn(
        "flex w-full min-h-20 resize-y rounded-lg border bg-background text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        sizeStyles[size],
        error
          ? "border-destructive focus-visible:border-destructive"
          : "border-input focus-visible:border-foreground",
        className
      )}
      {...props}
    />
  );
}
