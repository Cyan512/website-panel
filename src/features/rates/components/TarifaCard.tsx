import { cn } from "@/shared/utils/cn";
import type { Tarifa } from "../types";
import { MdEdit, MdDelete } from "react-icons/md";

interface Props {
  tarifa: Tarifa;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export function TarifaCard({ tarifa, onEdit, onDelete }: Props) {
  const precioTotal =
    tarifa.precio +
    (tarifa.iva != null ? (tarifa.precio * tarifa.iva) / 100 : 0) +
    (tarifa.cargo_servicios != null ? (tarifa.precio * tarifa.cargo_servicios) / 100 : 0);

  return (
    <div className="rounded-2xl flex-col justify-between border border-border bg-bg-card overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className="p-4 h-2/3">
        <div className="flex items-start gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-text-primary text-sm truncate">{tarifa.tipo_habitacion.nombre}</p>
            <p className="text-xs text-text-muted mt-0.5">{tarifa.canal.nombre}</p>
          </div>
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full bg-accent-primary/10 text-accent-primary shrink-0")}>
            {tarifa.moneda}
          </span>
        </div>

        <div className="space-y-1 text-xs text-text-muted">
          <p className="text-lg font-bold font-display text-accent-primary">
            {tarifa.precio.toFixed(2)}
            <span className="text-xs font-normal text-text-muted ml-1">/ {tarifa.unidad}</span>
          </p>
          {tarifa.iva != null && (
            <p>
              IVA: <span className="text-text-primary font-medium">{tarifa.iva}%</span>
            </p>
          )}
          {tarifa.cargo_servicios != null && (
            <p>
              Serv: <span className="text-text-primary font-medium">{tarifa.cargo_servicios}%</span>
            </p>
          )}
          {(tarifa.iva != null || tarifa.cargo_servicios != null) && (
            <p className="font-medium text-text-primary">
              Total: {tarifa.moneda} {precioTotal.toFixed(2)}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-border-light/50 bg-paper-medium/10 px-4 py-2.5">
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20 transition-all text-xs font-medium"
          >
            <MdEdit className="w-3.5 h-3.5" />
            Editar
          </button>
          <button
            onClick={onDelete}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 transition-all text-xs font-medium"
          >
            <MdDelete className="w-3.5 h-3.5" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
