import { type ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  label?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  label,
  description = "No hay datos para mostrar en este momento.",
  action,
  className,
}: EmptyStateProps) {
  const displayTitle = title || label || "Sin resultados";
  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-8", className)}>
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-bg-tertiary/60 border border-border/40 flex items-center justify-center mb-4 text-text-muted/70">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-text-primary tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
        {displayTitle}
      </h3>
      <p className="text-sm text-text-muted mt-2 max-w-xs leading-relaxed">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
