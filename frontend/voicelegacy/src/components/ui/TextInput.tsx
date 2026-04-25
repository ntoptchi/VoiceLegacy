import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  helperText?: string;
  errorText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      id,
      label,
      helperText,
      errorText,
      leftIcon,
      rightIcon,
      className,
      containerClassName,
      type = "text",
      disabled,
      ...props
    },
    ref,
  ) => {
    const reactId = useId();
    const inputId = id ?? reactId;
    const helperId = `${inputId}-helper`;
    const errorId = `${inputId}-error`;
    const hasError = Boolean(errorText);

    return (
      <div className={cn("flex flex-col gap-sm", containerClassName)}>
        {label ? (
          <label
            htmlFor={inputId}
            className="text-label-lg text-on-surface-variant"
          >
            {label}
          </label>
        ) : null}
        <div className="relative">
          {leftIcon ? (
            <span
              className="pointer-events-none absolute left-md top-1/2 -translate-y-1/2 text-outline"
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={
              hasError ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              "h-14 w-full rounded-xl border-2 bg-surface-container-lowest px-md text-body-md text-on-surface",
              "placeholder:text-outline",
              "transition-colors duration-200",
              "focus:outline-none focus:ring-0",
              "disabled:cursor-not-allowed disabled:bg-surface-container disabled:text-on-surface-variant disabled:opacity-70",
              hasError
                ? "border-error focus:border-error"
                : "border-outline-variant focus:border-primary",
              leftIcon ? "pl-12" : "",
              rightIcon ? "pr-12" : "",
              className,
            )}
            {...props}
          />
          {rightIcon ? (
            <span
              className="pointer-events-none absolute right-md top-1/2 -translate-y-1/2 text-outline"
              aria-hidden="true"
            >
              {rightIcon}
            </span>
          ) : null}
        </div>
        {hasError ? (
          <p id={errorId} className="text-body-sm text-error">
            {errorText}
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-body-sm text-on-surface-variant">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

TextInput.displayName = "TextInput";
