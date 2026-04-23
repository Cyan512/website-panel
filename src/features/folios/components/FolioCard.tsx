import type { Folio } from "../types";
import { MdEdit, MdDelete, MdShoppingCart, MdRoomService } from "react-icons/md";
import { cn } from "@/shared/utils/cn";
import { formatUTCDate } from "@/shared/utils/format";

interface Props {
  folio: Folio;
  reservaName?: string;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onAddProduct?: (e: React.MouseEvent) => void;
  onAddService?: (e: React.MouseEvent) => void;
}

export function FolioCard({ folio, reservaName, onEdit, onDelete, onAddProduct, onAddService }: Props) {
  return (
    <div className="rounded-2xl flex flex-col justify-between border border-border bg-bg-card overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0 flex-1">
            <p className="font-mono font-semibold text-text-primary text-sm">{folio.codigo}</p>
            <p className="text-xs text-text-muted mt-0.5">{reservaName || folio.reservaId}</p>
          </div>
          <span
            className={cn(
              "text-xs font-medium px-2 py-1 rounded-full flex-shrink-0",
              folio.estado ? "bg-success-bg text-success" : "bg-bg-tertiary text-text-muted",
            )}
          >
            {folio.estado ? "Abierto" : "Cerrado"}
          </span>
        </div>

        <div className="space-y-2 text-xs text-text-muted">
          {folio.observacion && (
            <p className="line-clamp-2 italic">{folio.observacion}</p>
          )}
          {folio.promociones.length > 0 && (
            <p className="text-text-primary font-medium">{folio.promociones.length} promoción{folio.promociones.length !== 1 ? "es" : ""}</p>
          )}
          {folio.cerradoEn && (
            <p className="text-text-muted">Cerrado: {formatUTCDate(folio.cerradoEn)}</p>
          )}
        </div>
      </div>

      <div className="border-t border-border-light/50 bg-paper-medium/10 px-4 py-2.5">
        <div className="flex flex-wrap gap-2">
          {folio.estado && (
            <>
              {onAddProduct && (
                <button
                  onClick={onAddProduct}
                  title="Agregar producto"
                  className="flex-1 min-w-[100px] flex items-center justify-center gap-1 px-2 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all text-xs font-medium"
                >
                  <MdShoppingCart className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Producto</span>
                </button>
              )}
              {onAddService && (
                <button
                  onClick={onAddService}
                  title="Agregar servicio"
                  className="flex-1 min-w-[100px] flex items-center justify-center gap-1 px-2 py-2 rounded-lg bg-info/10 text-info border border-info/20 hover:bg-info/20 transition-all text-xs font-medium"
                >
                  <MdRoomService className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Servicio</span>
                </button>
              )}
            </>
          )}
          <button
            onClick={onEdit}
            className="flex-1 min-w-[80px] flex items-center justify-center gap-1 px-2 py-2 rounded-lg bg-accent-primary/10 text-accent-primary border border-accent-primary/20 hover:bg-accent-primary/20 transition-all text-xs font-medium"
          >
            <MdEdit className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Editar</span>
          </button>
          <button
            onClick={onDelete}
            className="flex-1 min-w-[80px] flex items-center justify-center gap-1 px-2 py-2 rounded-lg bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 transition-all text-xs font-medium"
          >
            <MdDelete className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
