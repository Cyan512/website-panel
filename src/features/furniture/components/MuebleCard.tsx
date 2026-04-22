import { cn } from "@/shared/utils/cn";
import { muebleConditionLabels, muebleConditionColors } from "../types";
import type { Mueble } from "../types";
import { MdEdit, MdDelete, MdImage } from "react-icons/md";

interface Props {
  mueble: Mueble;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onViewImage: () => void;
  habitacionNro?: string;
}

export function MuebleCard({ mueble, onEdit, onDelete, onViewImage, habitacionNro }: Props) {
  const condicion = mueble.condicion as keyof typeof muebleConditionColors;
  const hasImage = !!mueble.url_imagen || (mueble.imagenes && mueble.imagenes.length > 0);

  return (
    <div className="rounded-2xl flex-col justify-between border border-border bg-bg-card overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className="p-4 h-2/3">
        <div className="flex items-start gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-text-primary text-sm truncate">{mueble.nombre}</p>
            <p className="text-xs text-text-muted mt-0.5">{mueble.codigo}</p>
          </div>
          <div className="flex flex-col justify-between items-end gap-1 shrink-0 h-full">
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", muebleConditionColors[condicion])}>
              {muebleConditionLabels[condicion]}
            </span>
          </div>
        </div>

        <div className="flex justify-between space-y-0.5 text-xs text-text-muted">
          <div>
            {mueble.categoria?.nombre && (
              <p>
                Categoría: <span className="text-text-primary font-medium">{mueble.categoria.nombre}</span>
              </p>
            )}
            {habitacionNro && (
              <p>
                Habitación: <span className="text-text-primary font-medium">Nro. {habitacionNro}</span>
              </p>
            )}
          </div>
          {hasImage && (
            <button
              onClick={onViewImage}
              className="p-1.5 rounded-lg bg-info/10 text-info border border-info/20 hover:bg-info/20 transition-all"
              title="Ver imagen"
            >
              <MdImage className="w-4 h-4" />
            </button>
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
