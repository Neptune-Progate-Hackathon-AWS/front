import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

type RadioSize = "sm" | "md" | "lg";

type RadioProps = Omit<ComponentProps<"input">, "size" | "type"> & {
  error?: boolean;
  size?: RadioSize;
};

const sizeStyles: Record<RadioSize, { container: string; dot: string }> = {
  sm: { container: "h-4 w-4", dot: "h-2 w-2" },
  md: { container: "h-[18px] w-[18px]", dot: "h-[9px] w-[9px]" },
  lg: { container: "h-5 w-5", dot: "h-[10px] w-[10px]" },
};

export function Radio({
  error,
  size = "md",
  className,
  ...props
}: RadioProps) {
  const s = sizeStyles[size];
  return (
    <span className="relative inline-flex items-center justify-center">
      <input
        type="radio"
        className={cn(
          "peer appearance-none cursor-pointer rounded-full border bg-transparent transition-colors checked:bg-primary checked:border-primary focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          s.container,
          error
            ? "border-destructive focus-visible:border-destructive"
            : "border-input focus-visible:border-foreground",
          className
        )}
        {...props}
      />
      <span
        className={`pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hidden rounded-full bg-primary-foreground peer-checked:block ${s.dot}`}
      />
    </span>
  );
}
