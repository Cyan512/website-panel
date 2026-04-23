import type { Huesped } from "../types";
import { MdEdit, MdDelete, MdEmail, MdPhone } from "react-icons/md";

interface Props {
  huesped: Huesped;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export function HuespedCard({ huesped, onEdit, onDelete }: Props) {
  return (
    <div className="rounded-2xl flex-col justify-between border border-border bg-bg-card overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className="p-4 h-2/3">
        <div className="flex items-start gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-text-primary text-sm truncate">
              {huesped.nombres} {huesped.apellidos}
            </p>
            <p className="text-xs text-text-muted mt-0.5">{huesped.nacionalidad}</p>
          </div>
        </div>

        <div className="space-y-2 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <MdEmail className="w-3.5 h-3.5 flex-shrink-0" />
            <p className="truncate">{huesped.email}</p>
          </div>
          {huesped.telefono && (
            <div className="flex items-center gap-2">
              <MdPhone className="w-3.5 h-3.5 flex-shrink-0" />
              <p className="truncate">{huesped.telefono}</p>
            </div>
          )}
          {huesped.observacion && (
            <p className="text-text-muted line-clamp-2 italic">{huesped.observacion}</p>
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
