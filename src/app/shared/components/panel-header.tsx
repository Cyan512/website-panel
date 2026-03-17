interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function PanelHeader({ title, subtitle, children }: Props) {
  return (
    <div className="relative overflow-hidden border rounded-sm">
      <div className="px-4 sm:px-5 py-3 sm:py-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 relative z-10">
        <div>
          <div className="text-base italic">{title}</div>
          {subtitle && <div className="text-xs italic mt-0.5">{subtitle}</div>}
        </div>
      </div>
      <div className="relative z-10 overflow-x-auto">{children}</div>
    </div>
  );
}
