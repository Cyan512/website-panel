import { useState, useEffect } from "react";
import { usePagos } from "../hooks/usePagos";
import type { CreatePagoDto, UpdatePagoDto, Pago, ConceptoPago, EstadoPago, MetodoPago } from "../types";
import { Modal, Button } from "@/components";
import { InputField } from "@/components";
import { sileo } from "sileo";

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
  { value: "APLICADO", label: "Aplicado" },
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
  { value: "CREDITO_AGENCIA", label: "Crédito Agencia" },
  { value: "VOUCHER", label: "Voucher" },
];

const MONEDAS = ["USD", "EUR", "PEN", "GBP"];

interface PagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  pago?: Pago | null;
}

export function PagoModal({ isOpen, onClose, onSuccess, pago }: PagoModalProps) {
  const { createPago, updatePago } = usePagos();
  const isEditing = !!pago;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (pago) {
      const fechaPago = pago.fecha_pago instanceof Date 
        ? pago.fecha_pago.toISOString().split("T")[0]
        : new Date(pago.fecha_pago).toISOString().split("T")[0];
      setFormData({
        concepto: pago.concepto || "RESERVA",
        estado: pago.estado || "CONFIRMADO",
        fecha_pago: fechaPago,
        monto: String(pago.monto).replace(".", ","),
        moneda: pago.moneda || "USD",
        metodo: pago.metodo || "EFECTIVO",
        notas: pago.notas || "",
      });
    } else {
      setFormData({ ...defaultFormData, fecha_pago: new Date().toISOString().split("T")[0] });
    }
  }, [pago]);

  const getMontoNumerico = () => {
    return parseFloat(formData.monto.replace(",", ".")) || 0;
  };

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
        const updateData: UpdatePagoDto = {
          concepto: formData.concepto,
          estado: formData.estado,
          fecha_pago: formData.fecha_pago,
          monto: montoNumerico,
          moneda: formData.moneda,
          metodo: formData.metodo,
          notas: formData.notas.trim() || undefined,
        };
        await updatePago(pago.id, updateData);
      } else {
        const createData: CreatePagoDto = {
          concepto: formData.concepto,
          estado: formData.estado,
          fecha_pago: formData.fecha_pago,
          monto: montoNumerico,
          moneda: formData.moneda,
          metodo: formData.metodo,
          notas: formData.notas.trim() || undefined,
        };
        await createPago(createData);
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'response' in error 
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
    if (parts.length > 2) {
      setFormData(prev => ({ ...prev, monto: parts[0] + "." + parts.slice(1).join("") }));
    } else {
      setFormData(prev => ({ ...prev, monto: cleaned }));
    }
  };

  const handleChange = (field: keyof typeof defaultFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar Pago" : "Nuevo Pago"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="mb-2">
            <label className="field-label block mb-2 text-text-secondary font-medium">Concepto</label>
            <select value={formData.concepto} onChange={(e) => handleChange("concepto", e.target.value)} className="field-input w-full rounded-xl py-3.5 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50">
              {CONCEPTO_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="mb-2">
            <label className="field-label block mb-2 text-text-secondary font-medium">Estado</label>
            <select value={formData.estado} onChange={(e) => handleChange("estado", e.target.value)} className="field-input w-full rounded-xl py-3.5 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50">
              {ESTADO_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InputField label="Monto" type="text" value={formData.monto} onChange={(e) => handleMontoChange(e.target.value)} placeholder="0.00" required />
          <div className="mb-2">
            <label className="field-label block mb-2 text-text-secondary font-medium">Moneda</label>
            <select value={formData.moneda} onChange={(e) => handleChange("moneda", e.target.value)} className="field-input w-full rounded-xl py-3.5 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50">
              {MONEDAS.map((mon) => <option key={mon} value={mon}>{mon}</option>)}
            </select>
          </div>
          <div className="mb-2">
            <label className="field-label block mb-2 text-text-secondary font-medium">Método</label>
            <select value={formData.metodo} onChange={(e) => handleChange("metodo", e.target.value)} className="field-input w-full rounded-xl py-3.5 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50">
              {METODO_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        <InputField label="Fecha de Pago" type="date" value={formData.fecha_pago || ""} onChange={(e) => handleChange("fecha_pago", e.target.value)} />

        <div className="mb-2">
          <label className="field-label block mb-2 text-text-secondary font-medium">Notas</label>
          <textarea value={formData.notas || ""} onChange={(e) => handleChange("notas", e.target.value)} rows={3} className="field-input w-full rounded-xl py-3 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50 resize-none" placeholder="Observaciones adicionales..." />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" isLoading={loading} className="flex-1">{loading ? (isEditing ? "Guardando..." : "Creando...") : (isEditing ? "Guardar" : "Crear")}</Button>
        </div>
      </form>
    </Modal>
  );
}
