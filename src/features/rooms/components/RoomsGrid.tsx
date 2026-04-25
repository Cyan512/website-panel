import type { Habitacion, PaginatedHabitaciones, TipoHabitacion } from "../types";
import { MdClose, MdMeetingRoom, MdSearch } from "react-icons/md";
import { cn } from "@/shared/utils/cn";
import { Pagination, EmptyState, CheckboxDropdown } from "@/components";
import { Spinner } from "@/shared/components/ui/spinner";
import { RoomCard } from "./RoomCard";

interface Props {
  habitaciones: Habitacion[];
  pagination: PaginatedHabitaciones["pagination"];
  limit: number;
  tipos: TipoHabitacion[];
  searchInput: string;
  filters: { tipo?: string; estado?: boolean };
  loading?: boolean;
  searching?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSearch: (q: string) => void;
  onTipoChange: (tipoId: string | null) => void;
  onEstadoChange: (estado: boolean | null) => void;
  onClearFilters: () => void;
  onEdit: (hab: Habitacion) => void;
  onDelete: (hab: Habitacion) => void;
  onViewCalendar: (hab: Habitacion) => void;
  onViewImages: (hab: Habitacion) => void;
}

export function RoomsGrid({
  habitaciones,
  pagination,
  limit,
  tipos,
  searchInput,
  filters,
  loading = false,
  searching = false,
  onPageChange,
  onLimitChange,
  onSearch,
  onTipoChange,
  onEstadoChange,
  onClearFilters,
  onEdit,
  onDelete,
  onViewCalendar,
  onViewImages,
}: Props) {
  const { page, totalPages, total, hasNextPage } = pagination;

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const hasActiveFilters =
    searchInput.trim() !== "" || filters.tipo !== undefined || filters.estado !== undefined;

  const tipoOptions = tipos.map((t) => ({ value: t.id, label: t.nombre }));
  const estadoOptions = [
    { value: "true", label: "Disponible" },
    { value: "false", label: "No disponible" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-50 max-w-75">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar por número..."
            className={cn(
              "w-full pl-9 pr-10 py-2 text-sm rounded-xl border border-border bg-bg-card text-text-primary",
              "placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all",
              searching && "border-accent-primary/50",
            )}
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Spinner size="sm" className="text-accent-primary" />
            </div>
          )}
        </div>

        <CheckboxDropdown
          label="Tipo"
          options={tipoOptions}
          selected={filters.tipo ?? null}
          onChange={onTipoChange}
        />
        <CheckboxDropdown
          label="Estado"
          options={estadoOptions}
          selected={filters.estado !== undefined ? String(filters.estado) : null}
          onChange={(v) => onEstadoChange(v === null ? null : v === "true")}
        />

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-danger/30 text-danger hover:bg-danger/10 transition-all"
          >
            <MdClose className="w-3.5 h-3.5" />
            Limpiar
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-text-muted">Cargando habitaciones...</div>
        </div>
      ) : habitaciones.length === 0 ? (
        <EmptyState
          icon={<MdMeetingRoom className="w-10 h-10 text-text-muted/50" />}
          title={hasActiveFilters ? "Sin resultados" : "Sin habitaciones"}
          description={
            hasActiveFilters
              ? "No se encontraron habitaciones con los filtros seleccionados"
              : "Comienza agregando tu primera habitación"
          }
          action={
            hasActiveFilters ? (
              <button
                onClick={onClearFilters}
                className="text-sm px-4 py-2 rounded-xl border border-border text-text-muted hover:text-text-primary transition-all"
              >
                Limpiar filtros
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {habitaciones.map((habitacion) => (
            <RoomCard
              key={habitacion.id}
              room={habitacion}
              onEdit={() => onEdit(habitacion)}
              onDelete={() => onDelete(habitacion)}
              onViewCalendar={() => onViewCalendar(habitacion)}
              onViewImages={() => onViewImages(habitacion)}
            />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        hasNextPage={hasNextPage}
        onPageChange={onPageChange}
        label={total === 0 ? "Sin resultados" : `${from}–${to} de ${total} habitación${total !== 1 ? "es" : ""}`}
        pageSizeValue={limit}
        onPageSizeChange={onLimitChange}
        pageSizeOptions={[5, 10, 25, 50]}
        className="px-0"
      />
    </div>
  );
}
