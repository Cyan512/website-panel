import { forwardRef } from "react";
import { cn } from "@/shared/utils/cn";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, hint, icon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-lg border bg-bg-secondary text-text-primary text-sm placeholder:text-text-muted placeholder:italic transition-all duration-200 focus:outline-none focus:ring-[3px] focus:ring-accent/20 focus:border-accent hover:border-border-light",
              icon ? "pl-9" : "px-3",
              "py-2 pr-3",
              error ? "border-danger focus:ring-danger/20 focus:border-danger" : "border-border"
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-danger">{error}</span>}
        {hint && !error && <span className="text-xs text-text-muted">{hint}</span>}
      </div>
    );
  }
);
InputField.displayName = "InputField";
