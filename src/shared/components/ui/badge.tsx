import { cn } from "@/shared/utils/cn";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "outline";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const dotMap: Record<BadgeVariant, string> = {
  default: "bg-text-muted",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
  outline: "bg-text-muted",
};

const variants: Record<BadgeVariant, string> = {
  default: "bg-bg-tertiary/80 text-text-primary border border-border/60",
  success: "bg-success-bg text-success border border-success/35",
  warning: "bg-warning-bg text-warning border border-warning/35",
  danger: "bg-danger-bg text-danger border border-danger/35",
  info: "bg-info-bg text-info border border-info/35",
  outline: "bg-transparent border border-border text-text-secondary",
};

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium tracking-wide",
        variants[variant],
        className
      )}
      {...props}
      style={{ fontFamily: 'var(--font-display)' }}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", dotMap[variant])} />
      {children}
    </span>
  );
}
