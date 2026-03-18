import { cn } from "@/utils/cn";

type SpinnerSize = "sm" | "md" | "lg";

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-3",
  lg: "w-12 h-12 border-4",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "border-primary border-t-transparent rounded-full animate-spin",
        sizeStyles[size],
        className
      )}
    />
  );
}

interface LoadingProps {
  text?: string;
  fullScreen?: boolean;
  size?: SpinnerSize;
}

export function Loading({ text = "Cargando...", fullScreen = false, size = "md" }: LoadingProps) {
  return (
    <div className={cn("flex items-center justify-center", fullScreen ? "min-h-screen" : "min-h-[60vh]")}>
      <div className="text-center">
        <Spinner size={size} className="mx-auto mb-3" />
        <p className="text-text-muted text-sm animate-pulse">{text}</p>
      </div>
    </div>
  );
}
