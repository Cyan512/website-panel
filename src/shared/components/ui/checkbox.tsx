import { forwardRef, useEffect, useId, useMemo } from "react";
import { cn } from "@/shared/utils/cn";

type CheckboxSize = "sm" | "md";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  indeterminate?: boolean;
  size?: CheckboxSize;
}

const sizeStyles: Record<CheckboxSize, { box: string; label: string; desc: string }> = {
  sm: { box: "w-4 h-4", label: "text-sm", desc: "text-xs" },
  md: { box: "w-5 h-5", label: "text-base", desc: "text-sm" },
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      id,
      label,
      description,
      indeterminate = false,
      size = "sm",
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const reactId = useId();
    const inputId = useMemo(() => id ?? `checkbox-${reactId}`, [id, reactId]);

    useEffect(() => {
      if (!ref) return;
      if (typeof ref === "function") return;
      if (!ref.current) return;
      ref.current.indeterminate = Boolean(indeterminate) && !Boolean(props.checked);
    }, [indeterminate, props.checked, ref]);

    const hasText = Boolean(label) || Boolean(description);

    const box = (
      <input
        {...props}
        ref={ref}
        id={inputId}
        type="checkbox"
        disabled={disabled}
        className={cn(
          "shrink-0 rounded border border-border bg-bg-card text-primary accent-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "cursor-pointer",
          sizeStyles[size].box,
          className
        )}
      />
    );

    if (!hasText) return box;

    return (
      <label
        htmlFor={inputId}
        className={cn(
          "flex items-start gap-3 select-none",
          disabled ? "cursor-not-allowed" : "cursor-pointer"
        )}
      >
        {box}
        <span className="flex flex-col leading-tight">
          {label && (
            <span className={cn("text-text-primary font-medium", sizeStyles[size].label)}>
              {label}
            </span>
          )}
          {description && (
            <span className={cn("text-text-muted", sizeStyles[size].desc)}>
              {description}
            </span>
          )}
        </span>
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
