interface Props {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export default function PanelHeader({ title, subtitle, action, children }: Props) {
  return (
    <div className="rounded-xl bg-bg-card border border-border">
      <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="hidden sm:block w-1 h-10 rounded-full bg-gradient-to-b from-primary to-accent" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-text-muted mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {action && <div className="sm:ml-auto">{action}</div>}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
