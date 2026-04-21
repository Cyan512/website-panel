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
      {icon && <div className="text-text-muted mb-3">{icon}</div>}
      <h3 className="text-base font-semibold text-text-primary">{displayTitle}</h3>
      <p className="text-sm text-text-muted mt-1 max-w-xs">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
