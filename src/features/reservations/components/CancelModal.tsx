import { useState } from "react";
import { Modal, Button } from "@/components";
import { sileo } from "sileo";
import { isHandledError } from "@/utils/error.utils";
import type { Reserva, CancelReserva } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reserva: Reserva;
  onCancel: (id: string, data: CancelReserva) => Promise<Reserva>;
}

export function CancelModal({ isOpen, onClose, onSuccess, reserva, onCancel }: Props) {
  const [motivo, setMotivo] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo.trim()) return sileo.error({ title: "Error", description: "El motivo es requerido" });

    setSaving(true);
    try {
      await onCancel(reserva.id, { motivoCancel: motivo.trim() });
      sileo.success({ title: "Reserva cancelada", description: reserva.codigo });
      onSuccess();
      onClose();
    } catch (err) {
      if (!isHandledError(err)) { sileo.error({ title: "Error", description: "No se pudo cancelar la reserva" }); }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cancelar Reserva">
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm">
          <p className="font-medium text-danger">Reserva: {reserva.codigo}</p>
          <p className="text-text-muted mt-1">{reserva.nombre_huesped} — Hab. {reserva.nro_habitacion}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label block mb-2 text-text-secondary font-medium">Motivo de cancelación</label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              className="field-input w-full rounded-xl py-3 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-danger/30 border border-border-light/50 resize-none"
              placeholder="Describe el motivo..."
              required
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Volver</Button>
            <Button type="submit" isLoading={saving} className="flex-1 !bg-danger hover:!bg-danger/90">
              {saving ? "Cancelando..." : "Confirmar cancelación"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
