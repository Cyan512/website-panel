import { cn } from "@/shared/utils/cn";
import { estadoEstadiaLabels, estadoEstadiaColors } from "../types";
import type { Estancia } from "../types";
import { formatUTCDate } from "@/shared/utils/format";

interface Props {
  estancia: Estancia;
  onClick: () => void;
}

export function EstanciaCard({ estancia, onClick }: Props) {
  const noches = estancia.fecha_salida
    ? Math.ceil((new Date(estancia.fecha_salida).getTime() - new Date(estancia.fecha_entrada).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div
      onClick={onClick}
      className="rounded-2xl border border-border bg-bg-card p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="font-semibold text-text-primary text-sm">{estancia.huesped.nombres} {estancia.huesped.apellidos}</p>
          <p className="text-xs text-text-muted mt-0.5">Hab. {estancia.habitacion.nro_habitacion} — Piso {estancia.habitacion.piso}</p>
        </div>
        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full shrink-0", estadoEstadiaColors[estancia.estado])}>
          {estadoEstadiaLabels[estancia.estado]}
        </span>
      </div>

      <div className="space-y-1 text-xs text-text-muted">
        <p>Entrada: <span className="text-text-primary font-medium">{formatUTCDate(estancia.fecha_entrada)}</span></p>
        {estancia.fecha_salida && (
          <p>Salida: <span className="text-text-primary font-medium">{formatUTCDate(estancia.fecha_salida)}</span></p>
        )}
        {noches != null && <p>{noches} {noches === 1 ? "noche" : "noches"}</p>}
      </div>
    </div>
  );
}
