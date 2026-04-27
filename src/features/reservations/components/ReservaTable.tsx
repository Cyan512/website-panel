import { cn } from "@/shared/utils/cn";
import { estadoReservaLabels, estadoReservaColors } from "../types";
import type { Reserva } from "../types";
import { formatUTCDate } from "@/shared/utils/format";
import { MdEdit, MdDelete, MdCancel } from "react-icons/md";

interface Props {
  reservas: Reserva[];
  loading: boolean;
  selectedReserva: Reserva | null;
  onSelect: (r: Reserva) => void;
  onEdit: (r: Reserva) => void;
  onCancel: (r: Reserva) => void;
  onDelete: (r: Reserva) => void;
  deleting?: boolean;
}

export function ReservaTable({
  reservas,
  loading,
  selectedReserva,
  onSelect,
  onEdit,
  onCancel,
  onDelete,
  deleting = false,
}: Props) {
  const noches = (r: Reserva) =>
    Math.ceil((new Date(r.fecha_fin).getTime() - new Date(r.fecha_inicio).getTime()) / 86400000);

  return (
    <div className="max-h-[calc(105dvh-420px)] overflow-y-auto scrollbar-custom">
      <table className="w-full text-base">
        <thead className="sticky top-0 bg-bg-primary z-10">
          <tr className="border-b border-border">
            <th className="text-left py-3 px-2 text-sm font-semibold text-text-muted uppercase tracking-wide">Código</th>
            <th className="text-left py-3 px-2 text-sm font-semibold text-text-muted uppercase tracking-wide">Huésped</th>
            <th className="text-left py-3 px-2 text-sm font-semibold text-text-muted uppercase tracking-wide hidden sm:table-cell">Habitación</th>
            <th className="text-left py-3 px-2 text-sm font-semibold text-text-muted uppercase tracking-wide hidden md:table-cell">Fechas</th>
            <th className="text-left py-3 px-2 text-sm font-semibold text-text-muted uppercase tracking-wide hidden lg:table-cell">Pax</th>
            <th className="text-left py-3 px-2 text-sm font-semibold text-text-muted uppercase tracking-wide">Estado</th>
            <th className="py-3 px-2 text-right text-sm font-semibold text-text-muted uppercase tracking-wide">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className="text-center py-10 text-text-muted text-sm">Buscando...</td>
            </tr>
          ) : reservas.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-10 text-text-muted">Sin resultados</td>
            </tr>
          ) : (
            reservas.map((r) => (
              <tr
                key={r.id}
                onClick={() => onSelect(r)}
                className={cn(
                  "border-b border-border/50 last:border-0 hover:bg-accent-primary/5 cursor-pointer transition-colors",
                  selectedReserva?.id === r.id && "bg-accent-primary/10",
                )}
              >
                <td className="py-3 px-2 font-mono text-sm font-medium text-accent-primary">{r.codigo}</td>
                <td className="py-3 px-2 font-medium text-text-primary">{r.nombre_huesped}</td>
                <td className="py-3 px-2 text-text-muted hidden sm:table-cell">Hab. {r.nro_habitacion}</td>
                <td className="py-3 px-2 hidden md:table-cell">
                  <p className="text-text-primary text-sm">{formatUTCDate(r.fecha_inicio)}</p>
                  <p className="text-text-muted text-sm">{formatUTCDate(r.fecha_fin)} · {noches(r)}n</p>
                </td>
                <td className="py-3 px-2 text-text-muted hidden lg:table-cell">
                  {r.adultos}A{r.ninos > 0 ? ` ${r.ninos}N` : ""}
                </td>
                <td className="py-3 px-2">
                  <span className={cn("text-sm font-medium px-2 py-0.5 rounded-full", estadoReservaColors[r.estado])}>
                    {estadoReservaLabels[r.estado]}
                  </span>
                </td>
                <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(r)}
                      title="Editar"
                      className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all"
                    >
                      <MdEdit className="w-4 h-4" />
                    </button>
                    {r.estado !== "CANCELADA" && r.estado !== "COMPLETADA" && r.estado !== "NO_LLEGO" && (
                      <button
                        onClick={() => onCancel(r)}
                        title="Cancelar"
                        className="p-1.5 rounded-lg text-text-muted hover:text-warning hover:bg-warning-bg transition-all"
                      >
                        <MdCancel className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(r)}
                      disabled={deleting}
                      title="Eliminar"
                      className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all disabled:opacity-40"
                    >
                      <MdDelete className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
