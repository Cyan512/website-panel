import { cn } from "@/shared/utils/cn";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "outline";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-bg-tertiary text-text-primary border border-border",
  success: "bg-success-bg text-success border border-success/20",
  warning: "bg-warning-bg text-warning border border-warning/20",
  danger: "bg-danger-bg text-danger border border-danger/20",
  info: "bg-info-bg text-info border border-info/20",
  outline: "bg-transparent border border-border text-text-secondary",
};

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
