import { useState } from "react";
import { Modal, Button, InputField } from "@/components";
import { sileo } from "sileo";
import { isHandledError } from "@/utils/error.utils";
import type { Estancia, CheckoutEstancia } from "../types";
import { formatUTCDateLong } from "@/utils/format.utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  estancia: Estancia;
  onCheckout: (id: string, data: CheckoutEstancia) => Promise<Estancia>;
}

export function CheckoutModal({ isOpen, onClose, onSuccess, estancia, onCheckout }: Props) {
  const [fechaSalida, setFechaSalida] = useState(new Date().toISOString().slice(0, 16));
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaSalida) return sileo.error({ title: "Error", description: "La fecha de salida es requerida" });

    setSaving(true);
    try {
      await onCheckout(estancia.id, { fechaSalida: new Date(fechaSalida) });
      sileo.success({ title: "Check-out realizado", description: `${estancia.huesped.nombres} ${estancia.huesped.apellidos}` });
      onSuccess();
      onClose();
    } catch (err) {
      if (!isHandledError(err)) { sileo.error({ title: "Error", description: "No se pudo realizar el check-out" }); }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Realizar Check-out">
      <div className="space-y-4">
        <div className="bg-paper-medium/20 rounded-xl p-4 text-sm space-y-1">
          <p><span className="text-text-muted">Huésped:</span> <span className="font-medium">{estancia.huesped.nombres} {estancia.huesped.apellidos}</span></p>
          <p><span className="text-text-muted">Habitación:</span> <span className="font-medium">Nro. {estancia.habitacion.nro_habitacion}</span></p>
          <p><span className="text-text-muted">Entrada:</span> <span className="font-medium">{formatUTCDateLong(estancia.fecha_entrada)}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Fecha de salida"
            type="datetime-local"
            value={fechaSalida}
            onChange={(e) => setFechaSalida(e.target.value)}
            required
          />
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" isLoading={saving} className="flex-1">{saving ? "Procesando..." : "Confirmar Check-out"}</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
