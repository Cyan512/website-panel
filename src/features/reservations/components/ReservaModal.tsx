import { useState, useEffect } from "react";
import { Modal, Button, InputField } from "@/components";
import { sileo } from "sileo";
import { isHandledError } from "@/utils/error.utils";
import type { Reserva, CreateReserva, UpdateReserva, EstadoReserva } from "../types";
import { estadoReservaLabels } from "../types";
import type { Huesped } from "@/features/clients/types";
import type { Habitacion } from "@/features/rooms/types";
import type { Tarifa } from "@/features/rates/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reserva?: Reserva | null;
  huespedes: Huesped[];
  habitaciones: Habitacion[];
  tarifas: Tarifa[];
  onCreate: (data: CreateReserva) => Promise<Reserva>;
  onUpdate: (data: UpdateReserva) => Promise<Reserva>;
}

const selectClass = "field-input w-full rounded-xl py-3.5 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50";
const labelClass = "field-label block mb-2 text-text-secondary font-medium";
const toDateInput = (d?: string | Date | null) => d ? new Date(d).toISOString().slice(0, 10) : "";

export function ReservaModal({ isOpen, onClose, onSuccess, reserva, huespedes, habitaciones, tarifas, onCreate, onUpdate }: Props) {
  const [form, setForm] = useState({
    huespedId: "", habitacionId: "", tarifaId: "",
    fecha_inicio: "", fecha_fin: "", adultos: "1", ninos: "0",
    estado: "TENTATIVA" as EstadoReserva,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (reserva) {
      setForm({
        huespedId: reserva.huespedId,
        habitacionId: reserva.habitacionId,
        tarifaId: reserva.tarifaId,
        fecha_inicio: toDateInput(reserva.fecha_inicio),
        fecha_fin: toDateInput(reserva.fecha_fin),
        adultos: String(reserva.adultos),
        ninos: String(reserva.ninos),
        estado: reserva.estado,
      });
    } else {
      setForm({
        huespedId: huespedes[0]?.id ?? "", habitacionId: habitaciones[0]?.id ?? "",
        tarifaId: tarifas[0]?.id ?? "", fecha_inicio: "", fecha_fin: "",
        adultos: "1", ninos: "0", estado: "TENTATIVA",
      });
    }
  }, [reserva, isOpen, huespedes, habitaciones, tarifas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fecha_inicio || !form.fecha_fin) return sileo.error({ title: "Error", description: "Las fechas son requeridas" });
    if (new Date(form.fecha_fin) <= new Date(form.fecha_inicio)) return sileo.error({ title: "Error", description: "La fecha de salida debe ser posterior a la entrada" });

    setSaving(true);
    try {
      if (reserva) {
        const updatePayload: UpdateReserva = {
          huespedId: form.huespedId,
          habitacionId: form.habitacionId,
          tarifaId: form.tarifaId,
          fechaInicio: new Date(form.fecha_inicio).toISOString().split('T')[0],
          fechaFin: new Date(form.fecha_fin).toISOString().split('T')[0],
          adultos: parseInt(form.adultos) || 1,
          ninos: parseInt(form.ninos) || 0,
          estado: form.estado,
        };
        await onUpdate(updatePayload);
      } else {
        const createPayload: CreateReserva = {
          huespedId: form.huespedId,
          habitacionId: form.habitacionId,
          tarifaId: form.tarifaId,
          fechaInicio: new Date(form.fecha_inicio).toISOString().split('T')[0],
          fechaFin: new Date(form.fecha_fin).toISOString().split('T')[0],
          adultos: parseInt(form.adultos) || 1,
          ninos: parseInt(form.ninos) || 0,
        };
        await onCreate(createPayload);
      }
      sileo.success({ title: reserva ? "Reserva actualizada" : "Reserva creada" });
      onSuccess();
      onClose();
    } catch (err) {
      if (!isHandledError(err)) { sileo.error({ title: "Error", description: "No se pudo guardar la reserva" }); }
    } finally {
      setSaving(false);
    }
  };

  const noches = form.fecha_inicio && form.fecha_fin
    ? Math.max(0, Math.ceil((new Date(form.fecha_fin).getTime() - new Date(form.fecha_inicio).getTime()) / 86400000))
    : 0;

  const tarifaSeleccionada = tarifas.find((t) => t.id === form.tarifaId);
  const montoBase = tarifaSeleccionada ? tarifaSeleccionada.precio_noche * noches : 0;
  const total = Math.max(0, montoBase);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={reserva ? "Editar Reserva" : "Nueva Reserva"} size="lg">
      <div className="max-h-[70vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reserva && (
            <div>
              <label className={labelClass}>Estado</label>
              <select value={form.estado} onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value as EstadoReserva }))} className={selectClass}>
                {Object.entries(estadoReservaLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Huésped</label>
            <select value={form.huespedId} onChange={(e) => setForm((f) => ({ ...f, huespedId: e.target.value }))} className={selectClass} required>
              <option value="">Seleccionar...</option>
              {huespedes.map((h) => <option key={h.id} value={h.id}>{h.nombres} {h.apellidos}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Habitación</label>
            <select value={form.habitacionId} onChange={(e) => setForm((f) => ({ ...f, habitacionId: e.target.value }))} className={selectClass} required>
              <option value="">Seleccionar...</option>
              {habitaciones.map((h) => <option key={h.id} value={h.id}>Hab. {h.nro_habitacion} — Piso {h.piso}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Tarifa</label>
          <select value={form.tarifaId} onChange={(e) => setForm((f) => ({ ...f, tarifaId: e.target.value }))} className={selectClass} required>
            <option value="">Seleccionar...</option>
            {tarifas.map((t) => <option key={t.id} value={t.id}>{t.tipo_habitacion.nombre} — {t.canal.nombre} ({t.moneda} {t.precio_noche}/noche)</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Fecha entrada" type="date" value={form.fecha_inicio} onChange={(e) => setForm((f) => ({ ...f, fecha_inicio: e.target.value }))} required />
          <InputField label="Fecha salida" type="date" value={form.fecha_fin} onChange={(e) => setForm((f) => ({ ...f, fecha_fin: e.target.value }))} required />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InputField label="Adultos" type="number" min={1} value={form.adultos} onChange={(e) => setForm((f) => ({ ...f, adultos: e.target.value }))} required />
          <InputField label="Niños" type="number" min={0} value={form.ninos} onChange={(e) => setForm((f) => ({ ...f, ninos: e.target.value }))} />
        </div>

        {noches > 0 && tarifaSeleccionada && (
          <div className="bg-accent-primary/5 border border-accent-primary/20 rounded-xl p-4 text-sm space-y-1">
            <div className="flex justify-between text-text-muted">
              <span>{noches} noche{noches !== 1 ? "s" : ""} × {tarifaSeleccionada.moneda} {tarifaSeleccionada.precio_noche}</span>
              <span>{tarifaSeleccionada.moneda} {montoBase.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-text-primary border-t border-accent-primary/20 pt-1 mt-1">
              <span>Total estimado</span>
              <span>{tarifaSeleccionada.moneda} {total.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" isLoading={saving} className="flex-1">{saving ? "Guardando..." : reserva ? "Actualizar" : "Crear"}</Button>
        </div>
      </form>
      </div>
    </Modal>
  );
}
