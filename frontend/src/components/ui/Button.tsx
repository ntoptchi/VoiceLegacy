import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "outline"
  | "ghost"
  | "destructive";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#3f5d47] !text-[#fff8ed] shadow-sm hover:bg-[#54745d] hover:!text-[#fff8ed] disabled:bg-surface-variant disabled:!text-on-surface-variant disabled:opacity-70",
  secondary:
    "bg-secondary text-on-secondary hover:bg-on-secondary-container disabled:opacity-60",
  tertiary:
    "bg-surface-container text-primary hover:bg-surface-dim disabled:opacity-60",
  outline:
    "bg-surface-container-lowest text-on-surface border border-outline-variant hover:bg-surface-container-low disabled:opacity-60",
  ghost:
    "bg-transparent text-on-surface-variant hover:bg-surface-container hover:text-on-surface disabled:opacity-60",
  destructive:
    "bg-surface-container-lowest text-error border border-error/30 hover:bg-error-container disabled:opacity-60",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-[40px] px-md text-label-md",
  md: "min-h-[48px] px-md text-label-md",
  lg: "min-h-[56px] px-xl text-label-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "lg",
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      type = "button",
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-sm rounded-full font-semibold tracking-[0.02em]",
          "text-center leading-tight",
          "transition-colors duration-200 active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {leftIcon ? (
          <span className="flex shrink-0 items-center" aria-hidden="true">
            {leftIcon}
          </span>
        ) : null}
        {children}
        {rightIcon ? (
          <span className="flex shrink-0 items-center" aria-hidden="true">
            {rightIcon}
          </span>
        ) : null}
      </button>
    );
  },
);

Button.displayName = "Button";
