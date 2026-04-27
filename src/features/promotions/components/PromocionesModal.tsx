import { useState, useEffect, useRef } from "react";
import { Modal, InputField, Checkbox, Button } from "@/components";
import { cn } from "@/shared/utils/cn";
import { MdClose, MdSearch, MdDiscount, MdCalendarToday, MdMeetingRoom } from "react-icons/md";
import { roomsApi } from "@/features/rooms/api";
import type { Promocion } from "../types";
import type { Habitacion } from "@/features/rooms/types";

interface PromoFormState {
  codigo: string;
  tipo_descuento: "PORCENTAJE" | "MONTO_FIJO";
  valor_descuento: string;
  vig_desde: string;
  vig_hasta: string;
  estado: boolean;
  habitaciones: string[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: PromoFormState) => Promise<void>;
  editingPromo: Promocion | null;
  saving: boolean;
}

const selectClass = "w-full rounded-xl py-3 text-sm px-3.5 border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30";
const labelClass = "block text-sm font-medium text-text-primary mb-1";

function toDateInput(d?: string | Date | null): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

function promoToForm(p: Promocion): PromoFormState {
  return {
    codigo: p.codigo,
    tipo_descuento: p.tipo_descuento,
    valor_descuento: String(p.valor_descuento),
    vig_desde: toDateInput(p.vig_desde),
    vig_hasta: toDateInput(p.vig_hasta),
    estado: p.estado,
    habitaciones: p.habitaciones,
  };
}

const emptyForm: PromoFormState = {
  codigo: "",
  tipo_descuento: "PORCENTAJE",
  valor_descuento: "",
  vig_desde: "",
  vig_hasta: "",
  estado: true,
  habitaciones: [],
};

export function PromocionesModal({
  isOpen,
  onClose,
  onSubmit,
  editingPromo,
  saving,
}: Props) {
  const [form, setForm] = useState<PromoFormState>(emptyForm);
  const [searchHab, setSearchHab] = useState("");
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [loadingHabs, setLoadingHabs] = useState(false);
  
  // Debounce refs
  const searchDebounceRef = useRef<number | null>(null);
  const searchAbortRef = useRef<AbortController | null>(null);

  // Reset form when modal opens/closes or editingPromo changes
  useEffect(() => {
    if (isOpen) {
      setForm(editingPromo ? promoToForm(editingPromo) : emptyForm);
      setSearchHab("");
      setHabitaciones([]);
    }
  }, [isOpen, editingPromo]);

  // Load habitaciones with search
  useEffect(() => {
    if (!isOpen) return;

    // Cancel previous debounce
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    
    // Cancel previous request
    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }

    if (!searchHab.trim()) {
      setHabitaciones([]);
      return;
    }

    // Debounce search
    searchDebounceRef.current = window.setTimeout(async () => {
      setLoadingHabs(true);
      const controller = new AbortController();
      searchAbortRef.current = controller;
      
      try {
        const result = await roomsApi.getByNumero(searchHab.trim(), controller.signal);
        if (!controller.signal.aborted) {
          setHabitaciones(result);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError" && err.name !== "CanceledError") {
          console.error("Error loading habitaciones:", err);
          if (!controller.signal.aborted) {
            setHabitaciones([]);
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingHabs(false);
        }
      }
    }, 300);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
      }
    };
  }, [isOpen, searchHab]);

  const toggleHabitacion = (id: string) => {
    setForm((f) => ({
      ...f,
      habitaciones: f.habitaciones.includes(id)
        ? f.habitaciones.filter((h) => h !== id)
        : [...f.habitaciones, id],
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(form);
  };

  const selectedCount = form.habitaciones.length;
  const discountPreview = form.valor_descuento 
    ? form.tipo_descuento === "PORCENTAJE" 
      ? `${form.valor_descuento}% de descuento`
      : `S/ ${parseFloat(form.valor_descuento).toFixed(2)} de descuento`
    : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingPromo ? "Editar Promoción" : "Nueva Promoción"} size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ── Layout en dos columnas ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Columna izquierda: Información básica y vigencia */}
          <div className="space-y-6">
            
            {/* ── Información básica ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-text-muted pb-2 border-b border-border/50">
                <MdDiscount className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Información de la promoción</span>
              </div>

              <InputField
                label="Código *"
                value={form.codigo}
                onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
                placeholder="PROMO-001"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Tipo de descuento *</label>
                  <select
                    value={form.tipo_descuento}
                    onChange={(e) => setForm((f) => ({ ...f, tipo_descuento: e.target.value as "PORCENTAJE" | "MONTO_FIJO" }))}
                    className={selectClass}
                    required
                  >
                    <option value="PORCENTAJE">Porcentaje (%)</option>
                    <option value="MONTO_FIJO">Monto fijo (S/)</option>
                  </select>
                </div>

                <InputField
                  label={`Valor ${form.tipo_descuento === "PORCENTAJE" ? "(%)" : "(S/)"} *`}
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.valor_descuento}
                  onChange={(e) => setForm((f) => ({ ...f, valor_descuento: e.target.value }))}
                  placeholder={form.tipo_descuento === "PORCENTAJE" ? "10" : "50.00"}
                  required
                />
              </div>

              {/* Preview del descuento */}
              {discountPreview && (
                <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-xl px-4 py-3 flex items-center gap-3">
                  <MdDiscount className="w-5 h-5 text-accent-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-text-muted">Vista previa del descuento</p>
                    <p className="text-sm font-semibold text-accent-primary">{discountPreview}</p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Vigencia ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-text-muted pb-2 border-b border-border/50">
                <MdCalendarToday className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Período de vigencia</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="Vigente desde *"
                  type="date"
                  value={form.vig_desde}
                  onChange={(e) => setForm((f) => ({ ...f, vig_desde: e.target.value }))}
                  required
                />
                <InputField
                  label="Vigente hasta *"
                  type="date"
                  value={form.vig_hasta}
                  onChange={(e) => setForm((f) => ({ ...f, vig_hasta: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* ── Estado ── */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-text-muted pb-2 border-b border-border/50">
                <span className="text-xs font-medium uppercase tracking-wide">Estado</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Checkbox
                  id="promo-estado"
                  size="md"
                  checked={form.estado}
                  onChange={(e) => setForm((f) => ({ ...f, estado: e.currentTarget.checked }))}
                  label="Promoción activa"
                />
                <span className="text-xs text-text-muted">
                  {form.estado ? "Visible y aplicable" : "Oculta y no aplicable"}
                </span>
              </div>
            </div>
          </div>

          {/* Columna derecha: Habitaciones */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-text-muted pb-2 border-b border-border/50">
              <MdMeetingRoom className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Habitaciones aplicables</span>
            </div>

            <div className="bg-info-bg/30 border border-info/20 rounded-xl px-4 py-2.5">
              <p className="text-xs text-text-muted">
                {selectedCount === 0 
                  ? "Sin habitaciones seleccionadas — la promoción aplica a todas las habitaciones" 
                  : `Promoción aplicable a ${selectedCount} habitación${selectedCount !== 1 ? "es" : ""} específica${selectedCount !== 1 ? "s" : ""}`
                }
              </p>
            </div>

            {/* Search input */}
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <input
                type="text"
                value={searchHab}
                onChange={(e) => setSearchHab(e.target.value)}
                placeholder="Buscar por número de habitación..."
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
              />
              {searchHab && (
                <button
                  type="button"
                  onClick={() => setSearchHab("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-bg-tertiary transition-colors"
                >
                  <MdClose className="w-4 h-4 text-text-muted" />
                </button>
              )}
            </div>

            {/* Selected chips */}
            {selectedCount > 0 && (
              <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10 max-h-24 overflow-y-auto scrollbar-custom">
                {form.habitaciones.map((id) => {
                  const hab = habitaciones.find((h) => h.id === id);
                  return (
                    <span 
                      key={id} 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 text-primary border border-primary/30 text-xs font-medium"
                    >
                      Hab. {hab?.nro_habitacion ?? id.slice(0, 6)}
                      <button
                        type="button"
                        onClick={() => toggleHabitacion(id)}
                        className="hover:text-danger transition-colors ml-0.5"
                      >
                        <MdClose className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Room grid - más alto para aprovechar el espacio */}
            <div className="rounded-xl border border-border bg-bg-secondary/30 overflow-hidden">
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 p-3 max-h-80 overflow-y-auto scrollbar-custom">
                {loadingHabs ? (
                  <div className="col-span-full text-center py-12">
                    <div className="inline-block w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-xs text-text-muted mt-3">Buscando habitaciones...</p>
                  </div>
                ) : habitaciones.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <MdMeetingRoom className="w-10 h-10 text-text-muted/30 mx-auto mb-3" />
                    <p className="text-xs text-text-muted">
                      {searchHab ? "No se encontraron habitaciones" : "Escribe un número para buscar"}
                    </p>
                  </div>
                ) : (
                  habitaciones.map((h) => {
                    const selected = form.habitaciones.includes(h.id);
                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => toggleHabitacion(h.id)}
                        className={cn(
                          "rounded-xl px-3 py-3 transition-all text-center border-2",
                          selected
                            ? "bg-primary border-primary text-white shadow-md scale-[1.02]"
                            : "bg-bg-card border-border text-text-muted hover:border-primary/50 hover:text-primary hover:shadow-sm"
                        )}
                      >
                        <span className="block font-bold text-sm">Nro. {h.nro_habitacion}</span>
                        <span className="block text-[10px] opacity-70 mt-0.5">Piso {h.piso}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>



        {/* ── Actions ── */}
        <div className="flex gap-3 pt-4 border-t border-border/50">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1" disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={saving} className="flex-1">
            {editingPromo ? "Actualizar Promoción" : "Crear Promoción"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
