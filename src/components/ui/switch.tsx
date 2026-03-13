import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

type SwitchSize = "sm" | "md" | "lg";

type SwitchProps = Omit<ComponentProps<"input">, "size" | "type" | "role"> & {
  error?: boolean;
  size?: SwitchSize;
};

const sizeStyles: Record<
  SwitchSize,
  { track: string; thumb: string; translate: string }
> = {
  sm: {
    track: "h-4 w-7",
    thumb: "h-3 w-3",
    translate: "peer-checked:translate-x-3",
  },
  md: {
    track: "h-5 w-9",
    thumb: "h-4 w-4",
    translate: "peer-checked:translate-x-4",
  },
  lg: {
    track: "h-6 w-11",
    thumb: "h-5 w-5",
    translate: "peer-checked:translate-x-5",
  },
};

export function Switch({
  error,
  size = "md",
  className,
  ...props
}: SwitchProps) {
  const s = sizeStyles[size];
  return (
    <span className="relative inline-flex">
      <input
        type="checkbox"
        role="switch"
        className={cn(
          "peer appearance-none cursor-pointer rounded-full border bg-switch-track transition-colors checked:bg-primary checked:border-primary focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          s.track,
          error
            ? "border-destructive focus-visible:border-destructive"
            : "border-switch-track focus-visible:border-foreground",
          className
        )}
        {...props}
      />
      <span
        className={`pointer-events-none absolute top-1/2 left-0.5 -translate-y-1/2 rounded-full bg-switch-thumb peer-checked:bg-primary-foreground transition-all ${s.translate} ${s.thumb}`}
      />
    </span>
  );
}
