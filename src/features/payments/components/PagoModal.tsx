import { useState, useEffect, useRef } from "react";
import { usePagos } from "../hooks/usePagos";
import type { CreatePago, UpdatePago, Pago, ConceptoPago, EstadoPago, MetodoPago } from "../types";
import { Modal, Button } from "@/components";
import { InputField } from "@/components";
import { sileo } from "sileo";
import { useReservas } from "@/features/reservations/hooks/useReservas";
import type { Reserva } from "@/features/reservations/types";
import { cn } from "@/utils/cn";
import { MdSearch } from "react-icons/md";
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

const MONEDAS = ["USD", "EUR", "PEN", "GBP"];
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
  const { reservas } = useReservas();
  const { data: session } = authClient.useSession();
  const isEditing = !!pago;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);

  // Reserva search
  const [reservaQuery, setReservaQuery] = useState("");
  const [reservaSeleccionada, setReservaSeleccionada] = useState<Reserva | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

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
    } else {
      setFormData({ ...defaultFormData, fecha_pago: new Date().toISOString().split("T")[0] });
      setReservaQuery("");
      setReservaSeleccionada(null);
    }
  }, [pago, isOpen]);

  const suggestions = reservaQuery.trim()
    ? reservas.filter((r) =>
        r.codigo.toLowerCase().includes(reservaQuery.toLowerCase()) ||
        r.nombre_huesped.toLowerCase().includes(reservaQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  const handleSelectReserva = (r: Reserva) => {
    setReservaSeleccionada(r);
    setReservaQuery(r.codigo);
    setShowSuggestions(false);
    // Autocompletar datos de la reserva
    setFormData((prev) => ({
      ...prev,
      concepto: "RESERVA",
      moneda: r.tarifa.moneda,
      monto: r.monto_final.toFixed(2),
    }));
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
          fecha_pago: formData.fecha_pago,
          monto: montoNumerico,
          moneda: formData.moneda,
          metodo: formData.metodo,
          observacion: formData.notas.trim() || undefined,
        };
        await updatePago(pago.id, updateData);
      } else {
        const createData: CreatePago = {
          reservaId: reservaSeleccionada?.id ?? null,
          concepto: formData.concepto,
          estado: formData.estado,
          fecha_pago: formData.fecha_pago,
          monto: montoNumerico,
          moneda: formData.moneda,
          metodo: formData.metodo,
          recibido_por_id: session?.user?.id ?? null,
          observacion: formData.notas.trim() || undefined,
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
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Buscador de reserva — solo al crear */}
        {!isEditing && (
          <div className="relative">
            <label className={labelClass}>Reserva (opcional)</label>
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                ref={searchRef}
                type="text"
                value={reservaQuery}
                onChange={(e) => { setReservaQuery(e.target.value); setReservaSeleccionada(null); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                placeholder="Buscar por código o nombre de huésped..."
                className={cn(selectClass, "pl-9", reservaSeleccionada ? "border-emerald-500/50 bg-emerald-500/5" : "")}
              />
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                {suggestions.map((r) => (
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
                        Hab. {r.nro_habitacion} · {r.tarifa.moneda} {r.monto_final.toFixed(2)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Preview reserva seleccionada */}
            {reservaSeleccionada && (
              <div className="mt-2 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-xs grid grid-cols-2 gap-x-4 gap-y-1">
                <span className="text-text-muted">Huésped</span>
                <span className="text-text-primary font-medium">{reservaSeleccionada.nombre_huesped}</span>
                <span className="text-text-muted">Habitación</span>
                <span className="text-text-primary font-medium">Nro. {reservaSeleccionada.nro_habitacion}</span>
                <span className="text-text-muted">Total reserva</span>
                <span className="text-text-primary font-medium">{reservaSeleccionada.tarifa.moneda} {reservaSeleccionada.monto_final.toFixed(2)}</span>
              </div>
            )}
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
    </Modal>
  );
}
