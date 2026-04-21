import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export default function PanelHeader({
  title,
  subtitle,
  children,
  action,
  className,
}: PanelHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text-primary font-display">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-text-muted mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="sm:ml-auto">{action}</div>}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
