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
    "bg-primary text-on-primary hover:bg-primary-container disabled:bg-surface-variant disabled:text-on-surface-variant disabled:opacity-70",
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
    const isBusy = props["aria-busy"] === true || props["aria-busy"] === "true";
    const interactive = !disabled && !isBusy;

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center gap-sm rounded-full font-semibold tracking-[0.02em]",
          "transition-all duration-300 ease-in-out active:scale-[0.98] will-change-transform",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none aria-busy:hover:scale-100 aria-busy:hover:shadow-none",
          interactive &&
            "hover:scale-[1.03] hover:shadow-[0_0_24px_rgba(71,100,79,0.35)]",
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
