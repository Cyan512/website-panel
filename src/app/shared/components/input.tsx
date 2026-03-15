import React from "react";
import { cn } from "@/utils/cn";

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
    helperText?: string;
};

export function InputField({
    label,
    error,
    helperText,
    className,
    id,
    ...props
}: InputFieldProps) {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
        <div className="mb-5">
            <label htmlFor={inputId} className="field-label block mb-2">{label}</label>

            <div className="relative">
                <input
                    id={inputId}
                    className={cn(
                        "field-input w-full rounded-sm py-3 text-sm pl-10 pr-3.5",
                        error && "border-red-500 focus:border-red-500",
                        className
                    )}
                    {...props}
                />
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            {helperText && !error && <p className="text-gray-500 text-sm mt-1">{helperText}</p>}
        </div>
    );
}