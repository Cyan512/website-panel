import { useState, useRef, useEffect } from "react";
import { MdKeyboardArrowDown, MdCheck } from "react-icons/md";
import { cn } from "@/shared/utils/cn";

interface CheckboxOption<T extends string = string> {
  value: T;
  label: string;
}

interface CheckboxDropdownProps<T extends string = string> {
  label: string;
  options: CheckboxOption<T>[];
  selected: T | null;
  onChange: (value: T | null) => void;
  className?: string;
}

export function CheckboxDropdown<T extends string = string>({ label, options, selected, onChange, className }: CheckboxDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === selected);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value: T) => {
    onChange(selected === value ? null : value);
  };

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 text-sm rounded-xl border transition-all",
          selected
            ? "border-accent-primary bg-accent-primary/10 text-accent-primary"
            : "border-border bg-bg-card text-text-primary hover:border-accent-primary/50",
        )}
      >
        <span className="font-medium">{label}:</span>
        <span className={cn(!selected && "text-text-muted")}>{selectedOption?.label || "Todos"}</span>
        <MdKeyboardArrowDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 min-w-45 bg-bg-card rounded-xl border border-border shadow-lg overflow-hidden">
          <div className="p-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                  selected === option.value ? "bg-accent-primary/10 text-accent-primary" : "text-text-primary hover:bg-bg-secondary",
                )}
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                    selected === option.value ? "bg-accent-primary border-accent-primary" : "border-border",
                  )}
                >
                  {selected === option.value && <MdCheck className="w-3 h-3 text-black" />}
                </div>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
