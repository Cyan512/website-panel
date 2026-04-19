import { useState, useEffect, useRef } from "react";
import { usePagos } from "../hooks/usePagos";
import type { CreatePago, UpdatePago, Pago, ConceptoPago, EstadoPago, MetodoPago } from "../types";
import { Modal, Button } from "@/components";
import { InputField } from "@/components";
import { sileo } from "sileo";
import type { Reserva } from "@/features/reservations/types";
import type { Folio, FolioWithConsumos } from "@/features/folios/types";
import { cn } from "@/utils/cn";
import { MdSearch, MdShoppingCart, MdRoomService } from "react-icons/md";
import { authClient } from "@/config/authClient";

const defaultFormData = {
  concepto: "RESERVA" as ConceptoPago,
  estado: "CONFIRMADO" as EstadoPago,
  fecha_pago: new Date().toISOString().split("T")[0],
  monto: "",
  moneda: "USD",
  metodo: "EFECTIVO" as MetodoPago,
  notas: "",
};

const CONCEPTO_OPTIONS = [
  { value: "RESERVA", label: "Reserva" },
  { value: "CONSUMO", label: "Consumo" },
];

const ESTADO_OPTIONS = [
  { value: "CONFIRMADO", label: "Confirmado" },
  { value: "DEVUELTO", label: "Devuelto" },
  { value: "RETENIDO", label: "Retenido" },
  { value: "ANULADO", label: "Anulado" },
];

const METODO_OPTIONS = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "VISA", label: "Visa" },
  { value: "MASTERCARD", label: "Mastercard" },
  { value: "AMEX", label: "American Express" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
];

const MONEDAS = ["USD", "EUR", "PEN", "SOL", "GBP"];
const selectClass = "field-input w-full rounded-xl py-3.5 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50";
const labelClass = "field-label block mb-2 text-text-secondary font-medium";

interface PagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pago?: Pago | null;
}

export function PagoModal({ isOpen, onClose, onSuccess, pago }: PagoModalProps) {
  const { createPago, updatePago } = usePagos();
  const { data: session } = authClient.useSession();
  const isEditing = !!pago;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);

  // Reserva search
  const [reservaQuery, setReservaQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Reserva[]>([]);
  const [reservaSeleccionada, setReservaSeleccionada] = useState<Reserva | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Folio selection
  const [foliosDisponibles, setFoliosDisponibles] = useState<Folio[]>([]);
  const [loadingFolios, setLoadingFolios] = useState(false);
  const [folioSeleccionado, setFolioSeleccionado] = useState<Folio | null>(null);

  // Folio consumos
  const [consumos, setConsumos] = useState<FolioWithConsumos | null>(null);
  const [loadingConsumos, setLoadingConsumos] = useState(false);

  const searchReservas = async (q: string) => {
    if (!q.trim()) { setSuggestions([]); return; }
    setSearching(true);
    try {
      const { reservasApi } = await import("@/features/reservations/api");
      const data = await reservasApi.getAll(1, 10, q);
      setSuggestions(data.list);
    } catch {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  };

  const handleQueryChange = (q: string) => {
    setReservaQuery(q);
    setReservaSeleccionada(null);
    setShowSuggestions(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchReservas(q), 300);
  };

  // Load available folios on mount
  useEffect(() => {
    if (!isOpen || isEditing) return;
    setLoadingFolios(true);
    import("@/features/folios/api").then(({ foliosApi }) =>
      foliosApi.getAll({ page: 1, limit: 50, estado: true }).then((data) => {
        setFoliosDisponibles(data.list);
      }).catch(() => setFoliosDisponibles([]))
    ).finally(() => setLoadingFolios(false));
  }, [isOpen, isEditing]);

  useEffect(() => {
    if (!isOpen) return;
    if (pago) {
      setFormData({
        concepto: pago.concepto || "RESERVA",
        estado: pago.estado || "CONFIRMADO",
        fecha_pago: new Date(pago.fecha_pago).toISOString().split("T")[0],
        monto: String(pago.monto).replace(".", ","),
        moneda: pago.moneda || "USD",
        metodo: pago.metodo || "EFECTIVO",
        notas: pago.observacion || "",
      });
      setReservaQuery("");
      setReservaSeleccionada(null);
      setFolioSeleccionado(null);
      setConsumos(null);
    } else {
      setFormData({ ...defaultFormData, fecha_pago: new Date().toISOString().split("T")[0] });
      setReservaQuery("");
      setReservaSeleccionada(null);
      setFolioSeleccionado(null);
      setConsumos(null);
    }
  }, [pago, isOpen]);

  const suggestions_filtered = reservaQuery.trim() ? suggestions : [];

  const handleSelectReserva = (r: Reserva) => {
    setReservaSeleccionada(r);
    setReservaQuery(`${r.codigo} — ${r.nombre_huesped}`);
    setShowSuggestions(false);
    setFolioSeleccionado(null);
    setConsumos(null);
    setFormData((prev) => ({
      ...prev,
      concepto: "RESERVA",
      monto: r.monto_total != null ? Number(r.monto_total).toFixed(2) : "",
    }));
  };

  const handleSelectFolio = async (folioId: string) => {
    const f = foliosDisponibles.find(folio => folio.id === folioId);
    if (!f) return;
    
    setFolioSeleccionado(f);
    setReservaSeleccionada(null);
    setReservaQuery("");
    setFormData((prev) => ({
      ...prev,
      concepto: "CONSUMO",
    }));

    // Load consumos
    setLoadingConsumos(true);
    try {
      const { foliosApi } = await import("@/features/folios/api");
      const data = await foliosApi.getConsumos(f.id);
      setConsumos(data);
      // Auto-fill monto with total
      if (data.total != null) {
        setFormData((prev) => ({
          ...prev,
          monto: Number(data.total).toFixed(2),
        }));
      }
    } catch {
      setConsumos(null);
    } finally {
      setLoadingConsumos(false);
    }
  };

  const getMontoNumerico = () => parseFloat(formData.monto.replace(",", ".")) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const montoNumerico = getMontoNumerico();
    if (montoNumerico <= 0) {
      sileo.error({ title: "Error", description: "El monto debe ser mayor a cero" });
      return;
    }
    setLoading(true);
    try {
      if (isEditing && pago) {
        const updateData: UpdatePago = {
          concepto: formData.concepto,
          estado: formData.estado,
          fecha_pago: formData.fecha_pago ? new Date(formData.fecha_pago) : undefined,
          monto: montoNumerico,
          moneda: formData.moneda,
          metodo: formData.metodo,
          observacion: formData.notas.trim() || undefined,
        };
        await updatePago(pago.id, updateData);
      } else {
        const createData: CreatePago = {
          concepto: formData.concepto,
          estado: formData.estado,
          fecha_pago: formData.fecha_pago ? new Date(formData.fecha_pago) : undefined,
          monto: montoNumerico,
          moneda: formData.moneda,
          metodo: formData.metodo,
          recibido_por_id: session?.user?.id ?? undefined,
          observacion: formData.notas.trim() || undefined,
          ...(reservaSeleccionada && { reserva_id: reservaSeleccionada.id }),
          ...(folioSeleccionado && { folio_id: folioSeleccionado.id }),
        };
        await createPago(createData);
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const message = error && typeof error === "object" && "response" in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || "No se pudo guardar el pago"
        : "No se pudo guardar el pago";
      sileo.error({ title: "Error", description: message });
    } finally {
      setLoading(false);
    }
  };

  const handleMontoChange = (value: string) => {
    const cleaned = value.replace(/[^0-9.,]/g, "");
    const normalized = cleaned.replace(",", ".");
    const parts = normalized.split(".");
    setFormData((prev) => ({
      ...prev,
      monto: parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : cleaned,
    }));
  };

  const handleChange = (field: keyof typeof defaultFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar Pago" : "Nuevo Pago"} size="lg">
      <div className="max-h-[70vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Buscador de reserva — solo al crear */}
        {!isEditing && (
          <div className="space-y-4">
            <div className="relative">
              <label className={labelClass}>Reserva (opcional)</label>
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  ref={searchRef}
                  type="text"
                  value={reservaQuery}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="Buscar por código o nombre de huésped..."
                  className={cn(selectClass, "pl-9", reservaSeleccionada ? "border-emerald-500/50 bg-emerald-500/5" : "")}
                  disabled={!!folioSeleccionado}
                />
              </div>

              {showSuggestions && (searching || suggestions_filtered.length > 0) && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                  {searching ? (
                    <div className="px-4 py-3 text-sm text-text-muted">Buscando...</div>
                  ) : suggestions_filtered.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onMouseDown={() => handleSelectReserva(r)}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-bg-hover transition-colors text-left border-b border-border/50 last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-primary">{r.codigo}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-paper-medium/30 text-text-muted">{r.estado}</span>
                        </div>
                        <p className="text-sm text-text-primary mt-0.5">{r.nombre_huesped}</p>
                        <p className="text-xs text-text-muted">
                          Hab. {r.nro_habitacion} {r.monto_total != null ? `· S/ ${Number(r.monto_total).toFixed(2)}` : ""}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {reservaSeleccionada && (
                <div className="mt-2 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-xs grid grid-cols-2 gap-x-4 gap-y-1">
                  <span className="text-text-muted">Huésped</span>
                  <span className="text-text-primary font-medium">{reservaSeleccionada.nombre_huesped}</span>
                  <span className="text-text-muted">Habitación</span>
                  <span className="text-text-primary font-medium">Nro. {reservaSeleccionada.nro_habitacion}</span>
                  <span className="text-text-muted">Total reserva</span>
                  <span className="text-text-primary font-medium">S/ {reservaSeleccionada.monto_total != null ? Number(reservaSeleccionada.monto_total).toFixed(2) : "—"}</span>
                </div>
              )}
            </div>

            {/* Selector de Folio */}
            <div>
              <label className={labelClass}>Folio (opcional)</label>
              <select
                value={folioSeleccionado?.id || ""}
                onChange={(e) => {
                  if (e.target.value) {
                    handleSelectFolio(e.target.value);
                  } else {
                    setFolioSeleccionado(null);
                    setConsumos(null);
                    setFormData((prev) => ({ ...prev, monto: "" }));
                  }
                }}
                className={cn(selectClass, folioSeleccionado ? "border-emerald-500/50 bg-emerald-500/5" : "")}
                disabled={!!reservaSeleccionada || loadingFolios}
              >
                <option value="">{loadingFolios ? "Cargando folios..." : "Seleccionar folio"}</option>
                {foliosDisponibles.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.codigo} — {f.estado ? "Abierto" : "Cerrado"}
                  </option>
                ))}
              </select>

              {folioSeleccionado && (
                <div className="mt-2 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-xs grid grid-cols-2 gap-x-4 gap-y-1">
                  <span className="text-text-muted">Código</span>
                  <span className="text-text-primary font-medium">{folioSeleccionado.codigo}</span>
                  <span className="text-text-muted">Estado</span>
                  <span className="text-text-primary font-medium">{folioSeleccionado.estado ? "Abierto" : "Cerrado"}</span>
                </div>
              )}

              {/* Consumos del folio */}
              {loadingConsumos && (
                <div className="mt-2 text-center py-3 text-text-muted text-xs">Cargando consumos...</div>
              )}
              {consumos && (consumos.productos.length > 0 || consumos.servicios.length > 0) && (
                <div className="mt-2 border border-border rounded-xl overflow-hidden">
                  <div className="bg-bg-card px-3 py-2 text-xs font-semibold text-text-muted uppercase border-b border-border">
                    Consumos del Folio
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {consumos.productos.map((p) => (
                      <div key={p.id} className="flex items-center justify-between px-3 py-2 text-xs border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-2">
                          <MdShoppingCart className="w-3 h-3 text-text-muted" />
                          <span className="text-text-primary">Producto</span>
                        </div>
                        <span className="text-text-muted">x{p.cantidad}</span>
                        <span className="text-text-primary font-medium">S/ {Number(p.total).toFixed(2)}</span>
                      </div>
                    ))}
                    {consumos.servicios.map((s) => (
                      <div key={s.id} className="flex items-center justify-between px-3 py-2 text-xs border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-2">
                          <MdRoomService className="w-3 h-3 text-text-muted" />
                          <span className="text-text-primary">{s.concepto}</span>
                        </div>
                        <span className="text-text-muted">S/ {Number(s.total).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  {consumos.total != null && (
                    <div className="flex items-center justify-between px-3 py-2 bg-primary/5 border-t border-primary/20">
                      <span className="text-xs font-semibold text-text-primary">Total</span>
                      <span className="text-xs font-bold text-primary">S/ {Number(consumos.total).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Concepto</label>
            <select value={formData.concepto} onChange={(e) => handleChange("concepto", e.target.value)} className={selectClass}>
              {CONCEPTO_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Estado</label>
            <select value={formData.estado} onChange={(e) => handleChange("estado", e.target.value)} className={selectClass}>
              {ESTADO_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InputField label="Monto" type="text" value={formData.monto} onChange={(e) => handleMontoChange(e.target.value)} placeholder="0.00" required />
          <div>
            <label className={labelClass}>Moneda</label>
            <select value={formData.moneda} onChange={(e) => handleChange("moneda", e.target.value)} className={selectClass}>
              {MONEDAS.map((mon) => <option key={mon} value={mon}>{mon}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Método</label>
            <select value={formData.metodo} onChange={(e) => handleChange("metodo", e.target.value)} className={selectClass}>
              {METODO_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        <InputField label="Fecha de Pago" type="date" value={formData.fecha_pago || ""} onChange={(e) => handleChange("fecha_pago", e.target.value)} />

        <div>
          <label className={labelClass}>Observaciones</label>
          <textarea value={formData.notas || ""} onChange={(e) => handleChange("notas", e.target.value)} rows={2} className="field-input w-full rounded-xl py-3 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50 resize-none" placeholder="Observaciones adicionales..." />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" isLoading={loading} className="flex-1">{loading ? (isEditing ? "Guardando..." : "Creando...") : (isEditing ? "Guardar" : "Crear")}</Button>
        </div>
      </form>
      </div>
    </Modal>
  );
}
