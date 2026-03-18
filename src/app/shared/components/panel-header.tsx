interface Props {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export default function PanelHeader({ title, subtitle, action, children }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-paper-lightest/80 backdrop-blur-xl border border-paper-dark/10 shadow-xl shadow-black/5">
      <div className="px-5 py-5 sm:py-6 border-b border-border-light/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex w-1 h-10 rounded-full bg-gradient-to-b from-accent-primary to-accent-light" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-playfair text-text-darkest tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-text-muted font-lora mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action && <div className="sm:ml-auto">{action}</div>}
      </div>
      <div className="relative z-10 overflow-x-auto">{children}</div>
    </div>
  );
}
