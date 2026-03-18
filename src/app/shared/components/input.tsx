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
        <div className="mb-2">
            <label htmlFor={inputId} className="field-label block mb-2 text-text-secondary font-medium">
                {label}
            </label>

            <div className="relative">
                {icon && (
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted/60 pointer-events-none">
                        {icon}
                    </div>
                )}
                <input
                    id={inputId}
                    className={cn(
                        "field-input w-full rounded-xl py-3.5 text-sm transition-all duration-200",
                        icon ? "pl-11 pr-3.5" : "px-3.5",
                        "focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary",
                        "placeholder:text-text-muted/40",
                        error 
                            ? "border-danger focus:border-danger focus:ring-danger/30" 
                            : "border-border-light/50 hover:border-border",
                        className
                    )}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-danger text-xs mt-1.5 font-medium">{error}</p>
            )}
            {helperText && !error && (
                <p className="text-text-muted text-xs mt-1.5">{helperText}</p>
            )}
        </div>
    );
}
