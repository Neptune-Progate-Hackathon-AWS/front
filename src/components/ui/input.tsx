"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type InputSize = "sm" | "md" | "lg";
type InputVariant = "outline" | "underline";

type InputProps = Omit<ComponentProps<"input">, "size"> & {
  error?: boolean;
  size?: InputSize;
  variant?: InputVariant;
};

const outlineSizeStyles: Record<InputSize, string> = {
  sm: "h-9 rounded-md",
  md: "h-10 rounded-lg",
  lg: "h-11 rounded-lg",
};

const underlineSizeStyles: Record<InputSize, string> = {
  sm: "h-9",
  md: "h-10",
  lg: "h-11",
};

export function Input({
  error,
  size = "md",
  variant = "underline",
  className,
  type,
  ...props
}: InputProps) {
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);

  const inputType = isPassword && showPassword ? "text" : type;

  if (variant === "underline") {
    return (
      <div className={cn("relative w-full", className)}>
        <input
          type={inputType}
          className={cn(
            "flex w-full border-b bg-transparent px-2 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
            underlineSizeStyles[size],
            error
              ? "border-destructive focus-visible:border-destructive"
              : "border-input focus-visible:border-foreground",
            isPassword && "pr-10",
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("relative w-full", className)}>
      <input
        type={inputType}
        className={cn(
          "flex w-full border bg-background px-3.5 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
          outlineSizeStyles[size],
          error
            ? "border-destructive focus-visible:border-destructive"
            : "border-input focus-visible:border-foreground",
          isPassword && "pr-10",
        )}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
          aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  );
}
