import { cn } from "@/shared/utils/cn";
import { muebleConditionLabels, muebleConditionColors } from "../types";
import type { Mueble } from "../types";
import { MdEdit, MdDelete } from "react-icons/md";

interface Props {
  mueble: Mueble;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  categoriaNombre?: string;
  habitacionNro?: string;
}

export function MuebleCard({ mueble, onClick, onEdit, onDelete, categoriaNombre, habitacionNro }: Props) {
  const condicion = mueble.condicion as keyof typeof muebleConditionColors;

  return (
    <div className="rounded-2xl border border-border bg-bg-card overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
      {/* Contenido principal clickeable */}
      <div onClick={onClick} className="p-4 cursor-pointer">
        {mueble.url_imagen && (
          <div className="w-full h-28 rounded-xl overflow-hidden mb-3 bg-paper-medium/20">
            <img src={mueble.url_imagen} alt={mueble.nombre} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <p className="font-semibold text-text-primary text-sm truncate">{mueble.nombre}</p>
            <p className="text-xs text-text-muted mt-0.5">{mueble.codigo}</p>
          </div>
          <span
            className={cn("text-xs font-medium px-2 py-0.5 rounded-full shrink-0", muebleConditionColors[condicion])}
          >
            {muebleConditionLabels[condicion]}
          </span>
        </div>

        <div className="space-y-0.5 text-xs text-text-muted">
          {(categoriaNombre || mueble.categoria_id) && (
            <p>
              Categoría:{" "}
              <span className="text-text-primary font-medium">
                {categoriaNombre ?? mueble.categoria_id.slice(0, 8) + "…"}
              </span>
            </p>
          )}
          {(habitacionNro || mueble.habitacion_id) && (
            <p>
              Habitación:{" "}
              <span className="text-text-primary font-medium">
                {habitacionNro ? `Nro. ${habitacionNro}` : mueble.habitacion_id!.slice(0, 8) + "…"}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Sección de acciones */}
      <div className="border-t border-border-light/50 bg-paper-medium/10 px-4 py-2.5">
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-2">Acciones</p>
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
