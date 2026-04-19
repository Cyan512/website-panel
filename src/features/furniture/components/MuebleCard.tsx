import { cn } from "@/utils/cn";
import { muebleConditionLabels, muebleConditionColors } from "../types";
import type { Mueble } from "../types";

interface Props {
  mueble: Mueble;
  onClick: () => void;
  categoriaNombre?: string;
  habitacionNro?: string;
}

export function MuebleCard({ mueble, onClick, categoriaNombre, habitacionNro }: Props) {
  const condicion = mueble.condicion as keyof typeof muebleConditionColors;

  return (
    <div onClick={onClick} className="rounded-2xl border border-border bg-bg-card p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5">
      {mueble.imagen_url && (
        <div className="w-full h-28 rounded-xl overflow-hidden mb-3 bg-paper-medium/20">
          <img src={mueble.imagen_url} alt={mueble.nombre} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="font-semibold text-text-primary text-sm truncate">{mueble.nombre}</p>
          <p className="text-xs text-text-muted mt-0.5">{mueble.codigo}</p>
        </div>
        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full shrink-0", muebleConditionColors[condicion])}>
          {muebleConditionLabels[condicion]}
        </span>
      </div>

      <div className="space-y-0.5 text-xs text-text-muted">
        {(categoriaNombre || mueble.categoria_id) && (
          <p>Categoría: <span className="text-text-primary font-medium">{categoriaNombre ?? mueble.categoria_id.slice(0, 8) + "…"}</span></p>
        )}
        {(habitacionNro || mueble.habitacion_id) && (
          <p>Habitación: <span className="text-text-primary font-medium">{habitacionNro ? `Nro. ${habitacionNro}` : mueble.habitacion_id!.slice(0, 8) + "…"}</span></p>
        )}
      </div>
    </div>
  );
}
