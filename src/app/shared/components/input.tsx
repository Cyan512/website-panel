import React from "react";
import { cn } from "@/utils/cn";

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
    helperText?: string;
    icon?: React.ReactNode;
};

export function InputField({
    label,
    error,
    helperText,
    icon,
    className,
    id,
    ...props
}: InputFieldProps) {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
        <div className="mb-4">
            <label htmlFor={inputId} className="field-label block mb-2">
                {label}
            </label>

            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                        {icon}
                    </div>
                )}
                <input
                    id={inputId}
                    className={cn(
                        "field-input w-full rounded-lg py-3 text-sm transition-all duration-200",
                        icon ? "pl-10 pr-4" : "px-4",
                        "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
                        error 
                            ? "border-danger focus:border-danger focus:ring-danger/30" 
                            : "border-border hover:border-border-light",
                        className
                    )}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-danger text-xs mt-1.5">{error}</p>
            )}
            {helperText && !error && (
                <p className="text-text-muted text-xs mt-1.5">{helperText}</p>
            )}
        </div>
    );
}
