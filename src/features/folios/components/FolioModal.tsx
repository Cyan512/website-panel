import { useState, useRef, useEffect } from "react";
import { Modal, Button } from "@/components";
import { sileo } from "sileo";
import { cn } from "@/shared/utils/cn";
import { MdSearch, MdClose, MdReceipt, MdPerson, MdDiscount, MdNotes } from "react-icons/md";
import { promocionesApi } from "@/features/promotions/api";
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

export function FolioModal({ isOpen, onClose, onSuccess, mode, folio, reservaMap, onSave }: FolioModalProps) {
  const [form, setForm] = useState<FolioFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Promociones search with debounce
  const [searchPromo, setSearchPromo] = useState("");
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [loadingPromos, setLoadingPromos] = useState(false);
  const promoDebounceRef = useRef<number | null>(null);
  const promoAbortRef = useRef<AbortController | null>(null);

  // Reserva search
  const [reservaQuery, setReservaQuery] = useState("");
  const [reservaSuggestions, setReservaSuggestions] = useState<Reserva[]>([]);
  const [reservaSelected, setReservaSelected] = useState<Reserva | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingReserva, setSearchingReserva] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load promociones with search
  useEffect(() => {
    if (!isOpen) return;

    // Cancel previous debounce
    if (promoDebounceRef.current) {
      clearTimeout(promoDebounceRef.current);
    }
    
    // Cancel previous request
    if (promoAbortRef.current) {
      promoAbortRef.current.abort();
    }

    if (!searchPromo.trim()) {
      setPromociones([]);
      return;
    }

    // Debounce search
    promoDebounceRef.current = window.setTimeout(async () => {
      setLoadingPromos(true);
      const controller = new AbortController();
      promoAbortRef.current = controller;
      
      try {
        const result = await promocionesApi.getByCodigo(searchPromo.trim(), controller.signal);
        if (!controller.signal.aborted) {
          setPromociones(result);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError" && err.name !== "CanceledError") {
          console.error("Error loading promociones:", err);
          if (!controller.signal.aborted) {
            setPromociones([]);
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingPromos(false);
        }
      }
    }, 300);

    return () => {
      if (promoDebounceRef.current) {
        clearTimeout(promoDebounceRef.current);
      }
      if (promoAbortRef.current) {
        promoAbortRef.current.abort();
      }
    };
  }, [isOpen, searchPromo]);

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
        const data = await reservasApi.getByNombre(q.trim());
        setReservaSuggestions(data.slice(0, 8));
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.reserva_id.trim()) {
      sileo.warning({ title: "Campo requerido", description: "El ID de reserva es obligatorio" });
      return;
    }
    setSaving(true);
    onSaveInternal();
  };

  const onSaveInternal = async () => {
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
    setSearchPromo("");
    setPromociones([]);
  };

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen && folio && mode === "edit") {
      setForm(folioToForm(folio));
    } else if (isOpen && mode === "create") {
      setForm(emptyForm);
    }
  }, [isOpen, folio, mode]);

  const selectedPromoCount = form.promocion_ids.length;

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title={mode === "create" ? "Nuevo Folio" : "Editar Folio"} size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ── Layout en dos columnas ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Columna izquierda: Información básica */}
          <div className="space-y-6">
            
            {/* ── Información del folio ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-text-muted pb-2 border-b border-border/50">
                <MdReceipt className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Información del folio</span>
              </div>

              {/* Reserva field */}
              {mode === "create" ? (
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <MdPerson className="w-4 h-4 text-text-muted" />
                    <label className={labelClass}>Reserva *</label>
                  </div>
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
                        "w-full pl-9 pr-4 py-3 rounded-xl border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow",
                        reservaSelected ? "border-success/40 bg-success-bg/40" : "border-border",
                      )}
                      required
                    />
                  </div>
                  {showSuggestions && (searchingReserva || reservaSuggestions.length > 0) && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto scrollbar-custom">
                      {searchingReserva ? (
                        <div className="px-4 py-6 text-center">
                          <div className="inline-block w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                          <p className="text-xs text-text-muted mt-2">Buscando reservas...</p>
                        </div>
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
                    <div className="mt-3 bg-success-bg/30 border border-success/20 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MdPerson className="w-4 h-4 text-success" />
                        <span className="text-xs font-medium text-success">Reserva seleccionada</span>
                      </div>
                      <div className="text-xs grid grid-cols-2 gap-x-4 gap-y-1">
                        <span className="text-text-muted">Código</span>
                        <span className="text-text-primary font-medium">{reservaSelected.codigo}</span>
                        <span className="text-text-muted">Huésped</span>
                        <span className="text-text-primary font-medium">{reservaSelected.nombre_huesped}</span>
                        <span className="text-text-muted">Habitación</span>
                        <span className="text-text-primary font-medium">Nro. {reservaSelected.nro_habitacion}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MdPerson className="w-4 h-4 text-text-muted" />
                    <label className={labelClass}>Reserva</label>
                  </div>
                  <input
                    value={reservaMap.get(folio?.reservaId ?? "") ?? folio?.reservaId ?? ""}
                    disabled
                    className="w-full px-3 py-3 rounded-xl border border-border bg-bg-card/50 text-text-muted cursor-not-allowed"
                  />
                </div>
              )}
            </div>

            {/* ── Observaciones ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-text-muted pb-2 border-b border-border/50">
                <MdNotes className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Observaciones</span>
              </div>

              <div>
                <label className={labelClass}>Observación</label>
                <textarea
                  value={form.observacion}
                  onChange={(e) => setForm((f) => ({ ...f, observacion: e.target.value }))}
                  placeholder="Observación opcional sobre el folio..."
                  rows={4}
                  className="w-full px-3 py-3 rounded-xl border border-border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-shadow"
                />
              </div>
            </div>
          </div>

          {/* Columna derecha: Promociones */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-text-muted pb-2 border-b border-border/50">
              <MdDiscount className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Promociones aplicables</span>
            </div>

            <div className="bg-info-bg/30 border border-info/20 rounded-xl px-4 py-2.5">
              <p className="text-xs text-text-muted">
                {selectedPromoCount === 0 
                  ? "Sin promociones seleccionadas — se aplicarán las tarifas normales" 
                  : `${selectedPromoCount} promoción${selectedPromoCount !== 1 ? "es" : ""} seleccionada${selectedPromoCount !== 1 ? "s" : ""} para este folio`
                }
              </p>
            </div>

            {/* Search input */}
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <input
                type="text"
                value={searchPromo}
                onChange={(e) => setSearchPromo(e.target.value)}
                placeholder="Buscar por código de promoción..."
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
              />
              {searchPromo && (
                <button
                  type="button"
                  onClick={() => setSearchPromo("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-bg-tertiary transition-colors"
                >
                  <MdClose className="w-4 h-4 text-text-muted" />
                </button>
              )}
            </div>

            {/* Selected chips */}
            {selectedPromoCount > 0 && (
              <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10 max-h-24 overflow-y-auto scrollbar-custom">
                {form.promocion_ids.map((id) => {
                  const promo = promociones.find((p) => p.id === id);
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 text-primary border border-primary/30 text-xs font-medium"
                    >
                      {promo?.codigo ?? id.slice(0, 8)}
                      <button 
                        type="button" 
                        onClick={() => togglePromocion(id)} 
                        className="hover:text-danger transition-colors ml-0.5"
                      >
                        <MdClose className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Promo grid - más alto para aprovechar el espacio */}
            <div className="rounded-xl border border-border bg-bg-secondary/30 overflow-hidden">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 max-h-80 overflow-y-auto scrollbar-custom">
                {loadingPromos ? (
                  <div className="col-span-full text-center py-12">
                    <div className="inline-block w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-xs text-text-muted mt-3">Buscando promociones...</p>
                  </div>
                ) : promociones.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <MdDiscount className="w-10 h-10 text-text-muted/30 mx-auto mb-3" />
                    <p className="text-xs text-text-muted">
                      {searchPromo ? "No se encontraron promociones" : "Escribe un código para buscar"}
                    </p>
                  </div>
                ) : (
                  promociones.map((p) => {
                    const selected = form.promocion_ids.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePromocion(p.id)}
                        className={cn(
                          "rounded-xl px-3 py-3 transition-all text-left border-2",
                          selected 
                            ? "bg-primary border-primary text-white shadow-md scale-[1.02]" 
                            : "bg-bg-card border-border text-text-muted hover:border-primary/50 hover:text-primary hover:shadow-sm"
                        )}
                      >
                        <span className="block font-bold text-sm truncate">{p.codigo}</span>
                        <span className="block text-[10px] opacity-70 mt-0.5">
                          {p.tipo_descuento === "PORCENTAJE" ? `${p.valor_descuento}%` : `S/ ${p.valor_descuento}`}
                        </span>
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
          <Button type="button" variant="secondary" onClick={closeModal} className="flex-1" disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={saving} className="flex-1">
            {mode === "create" ? "Crear Folio" : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
