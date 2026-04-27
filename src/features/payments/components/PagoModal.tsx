import { useState, useEffect, useRef } from "react";
import { usePagos } from "../hooks/usePagos";
import type { CreatePago, UpdatePago, Pago, ConceptoPago, EstadoPago, MetodoPago } from "../types";
import { Modal, Button } from "@/components";
import { InputField } from "@/components";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import type { Reserva } from "@/features/reservations/types";
import type { Folio, FolioWithConsumos } from "@/features/folios/types";
import { cn } from "@/shared/utils/cn";
import { MdSearch, MdShoppingCart, MdRoomService, MdPayment, MdPerson, MdReceipt, MdAttachMoney, MdNotes, MdAccountBalance, MdCreditCard, MdTrendingUp } from "react-icons/md";
import { authClient } from "@/shared/lib/auth";

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
  { value: "RESERVA", label: "Pago de Reserva", icon: MdAccountBalance, color: "text-primary" },
  { value: "CONSUMO", label: "Pago de Consumo", icon: MdShoppingCart, color: "text-success" },
];

const ESTADO_OPTIONS = [
  { value: "CONFIRMADO", label: "Confirmado", color: "text-success", bgColor: "bg-success-bg" },
  { value: "DEVUELTO", label: "Devuelto", color: "text-warning", bgColor: "bg-warning-bg" },
  { value: "RETENIDO", label: "Retenido", color: "text-info", bgColor: "bg-info-bg" },
  { value: "ANULADO", label: "Anulado", color: "text-danger", bgColor: "bg-danger-bg" },
];

const METODO_OPTIONS = [
  { value: "EFECTIVO", label: "Efectivo", icon: MdAttachMoney, color: "text-success" },
  { value: "VISA", label: "Visa", icon: MdCreditCard, color: "text-primary" },
  { value: "MASTERCARD", label: "Mastercard", icon: MdCreditCard, color: "text-warning" },
  { value: "AMEX", label: "American Express", icon: MdCreditCard, color: "text-info" },
  { value: "TRANSFERENCIA", label: "Transferencia Bancaria", icon: MdAccountBalance, color: "text-accent-primary" },
];

const MONEDAS = [
  { value: "USD", label: "USD ($)", symbol: "$" },
  { value: "EUR", label: "EUR (€)", symbol: "€" },
  { value: "PEN", label: "PEN (S/)", symbol: "S/" },
  { value: "SOL", label: "SOL (S/)", symbol: "S/" },
  { value: "GBP", label: "GBP (£)", symbol: "£" },
];
const selectClass =
  "field-input w-full rounded-xl py-3.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50";
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
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }
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
    import("@/features/folios/api")
      .then(({ foliosApi }) =>
        foliosApi
          .getAll({ page: 1, limit: 50, estado: true })
          .then((data) => {
            setFoliosDisponibles(data.list);
          })
          .catch(() => setFoliosDisponibles([])),
      )
      .finally(() => setLoadingFolios(false));
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
    const f = foliosDisponibles.find((folio) => folio.id === folioId);
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
      if (!isHandledError(error)) {
        const message =
          error && typeof error === "object" && "response" in error
            ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || "No se pudo guardar el pago"
            : "No se pudo guardar el pago";
        sileo.error({ title: "Error", description: message });
      }
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

  const selectedMoneda = MONEDAS.find(m => m.value === formData.moneda);
  const montoNumerico = getMontoNumerico();
  const selectedConcepto = CONCEPTO_OPTIONS.find(opt => opt.value === formData.concepto);
  const selectedEstado = ESTADO_OPTIONS.find(opt => opt.value === formData.estado);
  const selectedMetodo = METODO_OPTIONS.find(opt => opt.value === formData.metodo);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar Pago" : "Nuevo Pago"} size="2xl">
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-custom">
        <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* ── Header con resumen visual ── */}
        {(montoNumerico > 0 || selectedConcepto || selectedEstado) && (
          <div className="bg-gradient-to-r from-accent-primary/5 via-primary/5 to-accent-light/5 border border-accent-primary/20 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {selectedConcepto && (
                  <div className="flex items-center gap-2">
                    <selectedConcepto.icon className={cn("w-6 h-6", selectedConcepto.color)} />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{selectedConcepto.label}</p>
                      <p className="text-xs text-text-muted">Concepto del pago</p>
                    </div>
                  </div>
                )}
                {selectedEstado && (
                  <div className="flex items-center gap-2">
                    <div className={cn("w-4 h-4 rounded-full", selectedEstado.bgColor)} />
                    <div>
                      <p className={cn("text-sm font-medium", selectedEstado.color)}>{selectedEstado.label}</p>
                      <p className="text-xs text-text-muted">Estado actual</p>
                    </div>
                  </div>
                )}
              </div>
              {montoNumerico > 0 && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-accent-primary">
                    {selectedMoneda?.symbol} {montoNumerico.toFixed(2)}
                  </p>
                  <p className="text-xs text-text-muted">
                    {selectedMetodo?.label} • {formData.fecha_pago ? new Date(formData.fecha_pago).toLocaleDateString('es-PE') : 'Sin fecha'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Layout en tres columnas ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Columna 1: Origen del pago */}
          <div className="space-y-6">
            
            {/* ── Origen del pago (solo al crear) ── */}
            {!isEditing && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-text-muted pb-3 border-b border-border/50">
                  <MdPerson className="w-5 h-5" />
                  <span className="text-sm font-semibold uppercase tracking-wide">Origen del Pago</span>
                </div>

                <div className="bg-info-bg/20 border border-info/20 rounded-xl px-4 py-3">
                  <p className="text-xs text-text-muted leading-relaxed">
                    Vincula este pago a una reserva específica o a los consumos de un folio. También puedes crear un pago independiente.
                  </p>
                </div>

                {/* Buscador de reserva */}
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <MdPerson className="w-4 h-4 text-text-muted" />
                    <label className={labelClass}>Reserva</label>
                  </div>
                  <div className="relative">
                    <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      ref={searchRef}
                      type="text"
                      value={reservaQuery}
                      onChange={(e) => handleQueryChange(e.target.value)}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      placeholder="Buscar por código o huésped..."
                      className={cn(
                        selectClass, 
                        "pl-9", 
                        reservaSeleccionada ? "border-success/40 bg-success-bg/40" : "",
                        folioSeleccionado ? "opacity-50 cursor-not-allowed" : ""
                      )}
                      disabled={!!folioSeleccionado}
                    />
                  </div>

                  {showSuggestions && (searching || suggestions_filtered.length > 0) && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto scrollbar-custom">
                      {searching ? (
                        <div className="px-4 py-6 text-center">
                          <div className="inline-block w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                          <p className="text-xs text-text-muted mt-2">Buscando reservas...</p>
                        </div>
                      ) : (
                        suggestions_filtered.map((r) => (
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
                              <p className="text-text-primary mt-0.5">{r.nombre_huesped}</p>
                              <p className="text-xs text-text-muted">
                                Hab. {r.nro_habitacion} {r.monto_total != null ? `· S/ ${Number(r.monto_total).toFixed(2)}` : ""}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                  
                  {reservaSeleccionada && (
                    <div className="mt-3 bg-success-bg/30 border border-success/20 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MdPerson className="w-4 h-4 text-success" />
                        <span className="text-xs font-medium text-success">Reserva vinculada</span>
                      </div>
                      <div className="text-xs grid grid-cols-2 gap-x-4 gap-y-1">
                        <span className="text-text-muted">Huésped</span>
                        <span className="text-text-primary font-medium">{reservaSeleccionada.nombre_huesped}</span>
                        <span className="text-text-muted">Habitación</span>
                        <span className="text-text-primary font-medium">Nro. {reservaSeleccionada.nro_habitacion}</span>
                        <span className="text-text-muted">Total reserva</span>
                        <span className="text-text-primary font-medium">
                          S/ {reservaSeleccionada.monto_total != null ? Number(reservaSeleccionada.monto_total).toFixed(2) : "—"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Selector de Folio */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MdReceipt className="w-4 h-4 text-text-muted" />
                    <label className={labelClass}>Folio de Consumos</label>
                  </div>
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
                    className={cn(
                      selectClass, 
                      folioSeleccionado ? "border-success/40 bg-success-bg/40" : "",
                      reservaSeleccionada ? "opacity-50 cursor-not-allowed" : ""
                    )}
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
                    <div className="mt-3 bg-success-bg/30 border border-success/20 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MdReceipt className="w-4 h-4 text-success" />
                        <span className="text-xs font-medium text-success">Folio vinculado</span>
                      </div>
                      <div className="text-xs grid grid-cols-2 gap-x-4 gap-y-1">
                        <span className="text-text-muted">Código</span>
                        <span className="text-text-primary font-medium">{folioSeleccionado.codigo}</span>
                        <span className="text-text-muted">Estado</span>
                        <span className="text-text-primary font-medium">{folioSeleccionado.estado ? "Abierto" : "Cerrado"}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Columna 2: Información del pago */}
          <div className="space-y-6">
            
            {/* ── Detalles del pago ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-text-muted pb-3 border-b border-border/50">
                <MdPayment className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">Detalles del Pago</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Concepto *</label>
                  <div className="relative">
                    <select 
                      value={formData.concepto} 
                      onChange={(e) => handleChange("concepto", e.target.value)} 
                      className={selectClass}
                    >
                      {CONCEPTO_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {selectedConcepto && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <selectedConcepto.icon className={cn("w-4 h-4", selectedConcepto.color)} />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Estado *</label>
                  <div className="relative">
                    <select 
                      value={formData.estado} 
                      onChange={(e) => handleChange("estado", e.target.value)} 
                      className={selectClass}
                    >
                      {ESTADO_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {selectedEstado && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <div className={cn("w-3 h-3 rounded-full", selectedEstado.bgColor)} />
                      </div>
                    )}
                  </div>
                </div>

                <InputField
                  label="Fecha del Pago *"
                  type="date"
                  value={formData.fecha_pago || ""}
                  onChange={(e) => handleChange("fecha_pago", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* ── Monto y método ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-text-muted pb-3 border-b border-border/50">
                <MdAttachMoney className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">Monto y Método</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="Monto *"
                  type="text"
                  value={formData.monto}
                  onChange={(e) => handleMontoChange(e.target.value)}
                  placeholder="0.00"
                  required
                />
                <div>
                  <label className={labelClass}>Moneda *</label>
                  <select 
                    value={formData.moneda} 
                    onChange={(e) => handleChange("moneda", e.target.value)} 
                    className={selectClass}
                  >
                    {MONEDAS.map((mon) => (
                      <option key={mon.value} value={mon.value}>{mon.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Método de Pago *</label>
                <div className="relative">
                  <select 
                    value={formData.metodo} 
                    onChange={(e) => handleChange("metodo", e.target.value)} 
                    className={selectClass}
                  >
                    {METODO_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {selectedMetodo && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <selectedMetodo.icon className={cn("w-4 h-4", selectedMetodo.color)} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Columna 3: Consumos y resumen */}
          <div className="space-y-6">
            
            {/* ── Consumos del folio ── */}
            {loadingConsumos && (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-sm text-text-muted mt-4">Cargando consumos del folio...</p>
              </div>
            )}
            
            {consumos && (consumos.productos.length > 0 || consumos.servicios.length > 0) && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-text-muted pb-3 border-b border-border/50">
                  <MdShoppingCart className="w-5 h-5" />
                  <span className="text-sm font-semibold uppercase tracking-wide">Consumos del Folio</span>
                </div>

                <div className="rounded-xl border border-border bg-bg-secondary/30 overflow-hidden">
                  <div className="max-h-96 overflow-y-auto scrollbar-custom">
                    {consumos.productos.map((p, index) => (
                      <div key={index} className="flex items-center justify-between px-4 py-4 border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <MdShoppingCart className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-text-primary">Producto</span>
                            <p className="text-xs text-text-muted">Cantidad: {p.cantidad}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-text-primary">S/ {Number(p.total).toFixed(2)}</span>
                      </div>
                    ))}
                    {consumos.servicios.map((s) => (
                      <div key={s.id} className="flex items-center justify-between px-4 py-4 border-b border-border/50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                            <MdRoomService className="w-5 h-5 text-success" />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-text-primary">{s.concepto}</span>
                            <p className="text-xs text-text-muted">Servicio</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-text-primary">S/ {Number(s.total).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  {consumos.descuento != null && consumos.descuento > 0 && (
                    <div className="flex items-center justify-between px-4 py-4 bg-success-bg/30 border-t border-success/20">
                      <span className="text-sm font-semibold text-success">Descuento aplicado</span>
                      <span className="text-sm font-bold text-success">-S/ {Number(consumos.descuento).toFixed(2)}</span>
                    </div>
                  )}
                  
                  {consumos.total != null && (
                    <div className="flex items-center justify-between px-4 py-4 bg-accent-primary/10 border-t border-accent-primary/20">
                      <span className="text-base font-bold text-accent-primary">Total del folio</span>
                      <span className="text-xl font-bold text-accent-primary">S/ {Number(consumos.total).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Resumen final ── */}
            {!loadingConsumos && !consumos && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-text-muted pb-3 border-b border-border/50">
                  <MdTrendingUp className="w-5 h-5" />
                  <span className="text-sm font-semibold uppercase tracking-wide">Información Adicional</span>
                </div>

                <div className="bg-gradient-to-br from-info/10 to-primary/10 border border-info/20 rounded-xl px-4 py-6 text-center">
                  <MdPayment className="w-12 h-12 text-info mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-text-primary mb-2">Pago Independiente</h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Este pago no está vinculado a ninguna reserva o folio específico. 
                    Puedes usarlo para registrar pagos generales o anticipos.
                  </p>
                </div>
              </div>
            )}

            {/* ── Observaciones ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-text-muted pb-3 border-b border-border/50">
                <MdNotes className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">Observaciones</span>
              </div>

              <div>
                <label className={labelClass}>Notas del pago</label>
                <textarea
                  value={formData.notas || ""}
                  onChange={(e) => handleChange("notas", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-shadow"
                  placeholder="Detalles adicionales, referencia de transacción, etc..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-4 pt-6 border-t border-border/50 sticky bottom-0 bg-bg-card">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1" disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={loading} className="flex-1">
            {isEditing ? "Guardar Cambios" : "Crear Pago"}
          </Button>
        </div>
      </form>
      </div>
    </Modal>
  );
}
