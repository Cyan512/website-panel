import { cn } from "@/utils/cn";
import { tipoCanalLabels, tipoCanalColors } from "../types";
import type { CanalOutput } from "../types";

interface Props {
  canal: CanalOutput;
  onClick: () => void;
}

export function CanalCard({ canal, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl border p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5",
        canal.activo ? "bg-bg-card border-border" : "bg-bg-card/50 border-border/50 opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-text-primary text-sm leading-tight">{canal.nombre}</h3>
        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full shrink-0", tipoCanalColors[canal.tipo])}>
          {tipoCanalLabels[canal.tipo]}
        </span>
      </div>

      {canal.notas && (
        <p className="text-xs text-text-muted line-clamp-2 mb-3">{canal.notas}</p>
      )}

      <div className="flex items-center gap-1.5 mt-auto">
        <div className={cn("w-2 h-2 rounded-full", canal.activo ? "bg-emerald-500" : "bg-gray-400")} />
        <span className="text-xs text-text-muted">{canal.activo ? "Activo" : "Inactivo"}</span>
      </div>
    </div>
  );
}
