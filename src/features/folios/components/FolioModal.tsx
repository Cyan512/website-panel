import { useState, useRef } from "react";
import { Modal, Button } from "@/components";
import { sileo } from "sileo";
import { cn } from "@/shared/utils/cn";
import { MdSearch, MdClose } from "react-icons/md";
import type { Folio, CreateFolio, UpdateFolio } from "../types";
import type { Reserva } from "@/features/reservations/types";
import type { Promocion } from "@/features/promotions/types";

type ModalMode = "create" | "edit";

interface FolioFormState {
  reserva_id: string;
  observacion: string;
  promocion_ids: string[];
}

interface FolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: ModalMode;
  folio?: Folio | null;
  reservaMap: Map<string, string>;
  promociones: Promocion[];
  onSave: (data: CreateFolio | UpdateFolio, mode: ModalMode, folioId?: string) => Promise<void>;
}

const emptyForm: FolioFormState = { reserva_id: "", observacion: "", promocion_ids: [] };

function folioToForm(f: Folio): FolioFormState {
  return {
    reserva_id: f.reservaId,
    observacion: f.observacion ?? "",
    promocion_ids: f.promociones.map((p) => p.id),
  };
}

const labelClass = "block font-medium text-text-primary mb-1";

export function FolioModal({ isOpen, onClose, onSuccess, mode, folio, reservaMap, promociones, onSave }: FolioModalProps) {
  const [form, setForm] = useState<FolioFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [promoPage, setPromoPage] = useState(1);
  const promoLimit = 9;

  // Reserva search
  const [reservaQuery, setReservaQuery] = useState("");
  const [reservaSuggestions, setReservaSuggestions] = useState<Reserva[]>([]);
  const [reservaSelected, setReservaSelected] = useState<Reserva | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingReserva, setSearchingReserva] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleReservaQuery = (q: string) => {
    setReservaQuery(q);
    setReservaSelected(null);
    setForm((f) => ({ ...f, reserva_id: "" }));
    setShowSuggestions(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setReservaSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearchingReserva(true);
      try {
        const { reservasApi } = await import("@/features/reservations/api");
        const data = await reservasApi.getAll(1, 20, q);
        const q2 = q.toLowerCase();
        setReservaSuggestions(
          data.list
            .filter(
              (r) =>
                r.codigo.toLowerCase().includes(q2) ||
                r.nombre_huesped.toLowerCase().includes(q2) ||
                r.nro_habitacion.toLowerCase().includes(q2),
            )
            .slice(0, 8),
        );
      } catch {
        setReservaSuggestions([]);
      } finally {
        setSearchingReserva(false);
      }
    }, 300);
  };

  const handleSelectReserva = (r: Reserva) => {
    setReservaSelected(r);
    setReservaQuery(`${r.codigo} — ${r.nombre_huesped}`);
    setForm((f) => ({ ...f, reserva_id: r.id }));
    setShowSuggestions(false);
    setReservaSuggestions([]);
  };

  const togglePromocion = (id: string) => {
    setForm((f) => ({
      ...f,
      promocion_ids: f.promocion_ids.includes(id) ? f.promocion_ids.filter((p) => p !== id) : [...f.promocion_ids, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.reserva_id.trim()) {
      sileo.warning({ title: "Campo requerido", description: "El ID de reserva es obligatorio" });
      return;
    }
    setSaving(true);
    try {
      if (mode === "create") {
        const payload: CreateFolio = {
          reserva_id: form.reserva_id.trim(),
          observacion: form.observacion.trim() || undefined,
          promocion_ids: form.promocion_ids.length > 0 ? form.promocion_ids : undefined,
        };
        await onSave(payload, mode);
      } else if (folio) {
        const payload: UpdateFolio = {
          observacion: form.observacion.trim() || undefined,
          promocion_ids: form.promocion_ids,
        };
        await onSave(payload, mode, folio.id);
      }
      closeModal();
      onSuccess();
    } catch (err) {
      // Error is handled by parent
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    onClose();
    setForm(emptyForm);
    setReservaQuery("");
    setReservaSuggestions([]);
    setReservaSelected(null);
  };

  // Initialize form when modal opens
  if (isOpen && folio && mode === "edit" && form.reserva_id === "") {
    setForm(folioToForm(folio));
  }

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title={mode === "create" ? "Nuevo Folio" : "Editar Folio"} size="lg">
      <div className="max-h-[70vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reserva field */}
          {mode === "create" ? (
            <div className="relative">
              <label className={labelClass}>Reserva *</label>
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={reservaQuery}
                  onChange={(e) => handleReservaQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="Buscar por código o nombre..."
                  className={cn(
                    "w-full pl-9 pr-4 py-3 rounded-xl border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30",
                    reservaSelected ? "border-success/40 bg-success-bg/40" : "border-border",
                  )}
                  required
                />
              </div>
              {showSuggestions && (searchingReserva || reservaSuggestions.length > 0) && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                  {searchingReserva ? (
                    <div className="px-4 py-3 text-text-muted">Buscando...</div>
                  ) : (
                    reservaSuggestions.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onMouseDown={() => handleSelectReserva(r)}
                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-bg-hover transition-colors text-left border-b border-border/50 last:border-0"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-text-primary">
                              {r.codigo}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-paper-medium/30 text-text-muted">
                              {r.estado}
                            </span>
                          </div>
                          <p className="text-xs text-text-muted mt-0.5">
                            {r.nombre_huesped} · Hab. {r.nro_habitacion}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
              {reservaSelected && (
                <div className="mt-2 bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 text-xs grid grid-cols-2 gap-x-4 gap-y-1">
                  <span className="text-text-muted">Código</span>
                  <span className="text-text-primary font-medium">
                    {reservaSelected.codigo}
                  </span>
                  <span className="text-text-muted">Huésped</span>
                  <span className="text-text-primary font-medium">{reservaSelected.nombre_huesped}</span>
                  <span className="text-text-muted">Habitación</span>
                  <span className="text-text-primary font-medium">Nro. {reservaSelected.nro_habitacion}</span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className={labelClass}>Reserva</label>
              <input
                value={reservaMap.get(folio?.reservaId ?? "") ?? folio?.reservaId ?? ""}
                disabled
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-bg-card/50 text-text-muted cursor-not-allowed"
              />
            </div>
          )}

          {/* Observación */}
          <div>
            <label className={labelClass}>Observación</label>
            <textarea
              value={form.observacion}
              onChange={(e) => setForm((f) => ({ ...f, observacion: e.target.value }))}
              placeholder="Observación opcional..."
              rows={2}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {/* Promociones picker */}
          <div>
            <label className={labelClass}>
              Promociones
              <span className="text-text-muted font-normal ml-1">(opcional)</span>
            </label>

            {/* Selected chips */}
            {form.promocion_ids.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.promocion_ids.map((id) => {
                  const promo = promociones.find((p) => p.id === id);
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                    >
                      {promo?.codigo ?? id.slice(0, 8)}
                      <button type="button" onClick={() => togglePromocion(id)} className="hover:text-danger transition-colors">
                        <MdClose className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Promo grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-1 rounded-xl border border-border bg-bg-card">
              {promociones.length === 0 ? (
                <p className="text-text-muted text-center py-3">Sin promociones disponibles</p>
              ) : (
                promociones.slice((promoPage - 1) * promoLimit, promoPage * promoLimit).map((p) => {
                  const selected = form.promocion_ids.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePromocion(p.id)}
                      className={cn(
                        "rounded-lg px-2 py-2 text-xs font-medium transition-all text-left",
                        selected ? "bg-primary text-white" : "border border-border text-text-muted hover:border-primary/50 hover:text-primary",
                      )}
                    >
                      <span className="block font-semibold truncate">{p.codigo}</span>
                      <span className="block text-[10px] opacity-70">
                        {p.tipo_descuento === "PORCENTAJE" ? `${p.valor_descuento}%` : `S/ ${p.valor_descuento}`}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Mini pagination */}
            {Math.ceil(promociones.length / promoLimit) > 1 && (
              <div className="flex items-center justify-between gap-2 mt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPromoPage(Math.max(1, promoPage - 1))}
                  disabled={promoPage === 1}
                  className="px-2 py-1 rounded border border-border text-text-muted hover:text-primary hover:border-primary disabled:opacity-40 transition-all"
                >
                  ← Anterior
                </button>
                <span className="text-text-muted">
                  Pág {promoPage} de {Math.ceil(promociones.length / promoLimit)}
                </span>
                <button
                  type="button"
                  onClick={() => setPromoPage(Math.min(Math.ceil(promociones.length / promoLimit), promoPage + 1))}
                  disabled={promoPage === Math.ceil(promociones.length / promoLimit)}
                  className="px-2 py-1 rounded border border-border text-text-muted hover:text-primary hover:border-primary disabled:opacity-40 transition-all"
                >
                  Siguiente →
                </button>
              </div>
            )}

            <p className="text-xs text-text-muted mt-2">
              {form.promocion_ids.length === 0
                ? "Ninguna seleccionada"
                : `${form.promocion_ids.length} promoción${form.promocion_ids.length !== 1 ? "es" : ""} seleccionada${form.promocion_ids.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeModal} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? "Guardando..." : mode === "create" ? "Crear Folio" : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
