import { useState, useEffect } from "react";
import { Modal, Button, InputField } from "@/components";
import { sileo } from "sileo";
import { estadoEstadiaLabels } from "../types";
import type { EstanciaOutput, CreateEstanciaInput, EstadoEstadia } from "../types";
import type { Huesped } from "@/features/clients/types";
import type { Habitacion } from "@/features/rooms/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  estancia?: EstanciaOutput | null;
  habitaciones: Habitacion[];
  huespedes: Huesped[];
  onSave: (data: CreateEstanciaInput) => Promise<EstanciaOutput>;
}

const toDateInput = (d?: string | Date | null) => {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 16);
};

const selectClass = "field-input w-full rounded-xl py-3.5 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50";
const labelClass = "field-label block mb-2 text-text-secondary font-medium";

export function EstanciaModal({ isOpen, onClose, onSuccess, estancia, habitaciones, huespedes, onSave }: Props) {
  const [form, setForm] = useState({
    reservaId: "",
    habitacionId: "",
    huespedId: "",
    fechaEntrada: "",
    fechaSalida: "",
    estado: "ACTIVA" as EstadoEstadia,
    notas: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (estancia) {
      setForm({
        reservaId: estancia.reservaId,
        habitacionId: estancia.habitacion.id,
        huespedId: estancia.huesped.id,
        fechaEntrada: toDateInput(estancia.fechaEntrada),
        fechaSalida: toDateInput(estancia.fechaSalida),
        estado: estancia.estado,
        notas: estancia.notas ?? "",
      });
    } else {
      setForm({
        reservaId: "",
        habitacionId: habitaciones[0]?.id ?? "",
        huespedId: huespedes[0]?.id ?? "",
        fechaEntrada: toDateInput(new Date()),
        fechaSalida: "",
        estado: "ACTIVA",
        notas: "",
      });
    }
  }, [estancia, isOpen, habitaciones, huespedes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.habitacionId) return sileo.error({ title: "Error", description: "Selecciona una habitación" });
    if (!form.huespedId) return sileo.error({ title: "Error", description: "Selecciona un huésped" });
    if (!form.reservaId.trim()) return sileo.error({ title: "Error", description: "El ID de reserva es requerido" });

    const payload: CreateEstanciaInput = {
      reservaId: form.reservaId.trim(),
      habitacionId: form.habitacionId,
      huespedId: form.huespedId,
      estado: form.estado,
      ...(form.fechaEntrada && { fechaEntrada: new Date(form.fechaEntrada) }),
      ...(form.fechaSalida ? { fechaSalida: new Date(form.fechaSalida) } : { fechaSalida: null }),
      ...(form.notas.trim() ? { notas: form.notas.trim() } : { notas: null }),
    };

    setSaving(true);
    try {
      await onSave(payload);
      sileo.success({ title: estancia ? "Estancia actualizada" : "Estancia creada" });
      onSuccess();
      onClose();
    } catch {
      sileo.error({ title: "Error", description: "No se pudo guardar la estancia" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={estancia ? "Editar Estancia" : "Nueva Estancia"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="ID de Reserva"
          value={form.reservaId}
          onChange={(e) => setForm((f) => ({ ...f, reservaId: e.target.value }))}
          placeholder="ID de la reserva asociada"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Habitación</label>
            <select value={form.habitacionId} onChange={(e) => setForm((f) => ({ ...f, habitacionId: e.target.value }))} className={selectClass} required>
              <option value="">Seleccionar...</option>
              {habitaciones.map((h) => (
                <option key={h.id} value={h.id}>Hab. {h.nro_habitacion} — Piso {h.piso}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Huésped</label>
            <select value={form.huespedId} onChange={(e) => setForm((f) => ({ ...f, huespedId: e.target.value }))} className={selectClass} required>
              <option value="">Seleccionar...</option>
              {huespedes.map((h) => (
                <option key={h.id} value={h.id}>{h.nombres} {h.apellidos}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Fecha de entrada"
            type="datetime-local"
            value={form.fechaEntrada}
            onChange={(e) => setForm((f) => ({ ...f, fechaEntrada: e.target.value }))}
          />
          <InputField
            label="Fecha de salida (opcional)"
            type="datetime-local"
            value={form.fechaSalida}
            onChange={(e) => setForm((f) => ({ ...f, fechaSalida: e.target.value }))}
          />
        </div>

        <div>
          <label className={labelClass}>Estado</label>
          <select value={form.estado} onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value as EstadoEstadia }))} className={selectClass}>
            {Object.entries(estadoEstadiaLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Notas (opcional)</label>
          <textarea
            value={form.notas}
            onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))}
            rows={2}
            className="field-input w-full rounded-xl py-3 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50 resize-none"
            placeholder="Observaciones..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" isLoading={saving} className="flex-1">{saving ? "Guardando..." : estancia ? "Actualizar" : "Crear"}</Button>
        </div>
      </form>
    </Modal>
  );
}
