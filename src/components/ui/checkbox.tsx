import { Check } from "lucide-react";
import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

type CheckboxSize = "sm" | "md" | "lg";

type CheckboxProps = Omit<ComponentProps<"input">, "size" | "type"> & {
  error?: boolean;
  size?: CheckboxSize;
};

const sizeStyles: Record<CheckboxSize, string> = {
  sm: "h-4 w-4 rounded",
  md: "h-[18px] w-[18px] rounded",
  lg: "h-5 w-5 rounded-md",
};

export function Checkbox({
  error,
  size = "md",
  className,
  ...props
}: CheckboxProps) {
  return (
    <span className="relative inline-flex">
      <input
        type="checkbox"
        className={cn(
          "peer appearance-none cursor-pointer border bg-transparent transition-colors checked:bg-primary checked:border-primary focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          sizeStyles[size],
          error
            ? "border-destructive focus-visible:border-destructive"
            : "border-input focus-visible:border-foreground",
          className
        )}
        {...props}
      />
      <Check
        size="100%"
        strokeWidth={3}
        className="pointer-events-none absolute inset-0 hidden p-[2px] text-primary-foreground peer-checked:block"
      />
    </span>
  );
}
