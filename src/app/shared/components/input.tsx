import React from "react";

type InputFieldProps = {
    label: string;
    type?: string;
    placeholder?: string;
    value: string;
    disabled?: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function InputField({
    label,
    type = "text",
    placeholder,
    value,
    disabled,
    onChange,
}: InputFieldProps) {
    return (
        <div className="mb-5">
            <label className="field-label block mb-2">{label}</label>

            <div className="relative">
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className="field-input w-full rounded-sm py-3 text-sm pl-10 pr-3.5"
                />
            </div>
        </div>
    );
}