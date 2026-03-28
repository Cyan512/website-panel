import { useState, useEffect } from "react";
import { Modal, Button, InputField } from "@/components";
import { sileo } from "sileo";
import { isHandledError } from "@/utils/error.utils";
import type { Tarifa, CreateTarifa } from "../types";
import type { TipoHabitacion } from "@/features/rooms/types";
import type { Canal } from "@/features/channels/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tarifa?: Tarifa | null;
  tiposHabitacion: TipoHabitacion[];
  canales: Canal[];
  onSave: (data: CreateTarifa) => Promise<Tarifa>;
}

const defaultForm = {
  tipo_habitacion_id: "",
  canal_id: "",
  precio_noche: "",
  iva: "",
  cargo_servicios: "",
  moneda: "USD",
};

const MONEDAS = ["USD", "PEN", "EUR"];

export function TarifaModal({ isOpen, onClose, onSuccess, tarifa, tiposHabitacion, canales, onSave }: Props) {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tarifa) {
      setForm({
        tipo_habitacion_id: tarifa.tipo_habitacion.id,
        canal_id: tarifa.canal.id,
        precio_noche: String(tarifa.precio_noche),
        iva: tarifa.iva != null ? String(tarifa.iva) : "",
        cargo_servicios: tarifa.cargo_servicios != null ? String(tarifa.cargo_servicios) : "",
        moneda: tarifa.moneda,
      });
    } else {
      setForm({
        ...defaultForm,
        tipo_habitacion_id: tiposHabitacion[0]?.id ?? "",
        canal_id: canales[0]?.id ?? "",
      });
    }
  }, [tarifa, isOpen, tiposHabitacion, canales]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const precio = parseFloat(form.precio_noche);
    if (!form.tipo_habitacion_id) return sileo.error({ title: "Error", description: "Selecciona un tipo de habitación" });
    if (!form.canal_id) return sileo.error({ title: "Error", description: "Selecciona un canal" });
    if (!precio || precio <= 0) return sileo.error({ title: "Error", description: "El precio debe ser mayor a 0" });

    const payload: CreateTarifa = {
      tipo_habitacion_id: form.tipo_habitacion_id,
      canal_id: form.canal_id,
      precio_noche: precio,
      moneda: form.moneda,
      ...(form.iva !== "" && { iva: parseFloat(form.iva) }),
      ...(form.cargo_servicios !== "" && { cargo_servicios: parseFloat(form.cargo_servicios) }),
    };

    setSaving(true);
    try {
      await onSave(payload);
      sileo.success({ title: tarifa ? "Tarifa actualizada" : "Tarifa creada" });
      onSuccess();
      onClose();
    } catch (err) {
      if (!isHandledError(err)) { sileo.error({ title: "Error", description: "No se pudo guardar la tarifa" }); }
    } finally {
      setSaving(false);
    }
  };

  const selectClass = "field-input w-full rounded-xl py-3.5 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50";
  const labelClass = "field-label block mb-2 text-text-secondary font-medium";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={tarifa ? "Editar Tarifa" : "Nueva Tarifa"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Tipo de Habitación</label>
            <select value={form.tipo_habitacion_id} onChange={(e) => setForm((f) => ({ ...f, tipo_habitacion_id: e.target.value }))} className={selectClass} required>
              <option value="">Seleccionar...</option>
              {tiposHabitacion.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Canal</label>
            <select value={form.canal_id} onChange={(e) => setForm((f) => ({ ...f, canal_id: e.target.value }))} className={selectClass} required>
              <option value="">Seleccionar...</option>
              {canales.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Precio por noche"
            type="number"
            min={0}
            step={0.01}
            value={form.precio_noche}
            onChange={(e) => setForm((f) => ({ ...f, precio_noche: e.target.value }))}
            placeholder="0.00"
            required
          />
          <div>
            <label className={labelClass}>Moneda</label>
            <select value={form.moneda} onChange={(e) => setForm((f) => ({ ...f, moneda: e.target.value }))} className={selectClass}>
              {MONEDAS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="IVA % (opcional)"
            type="number"
            min={0}
            step={0.01}
            value={form.iva}
            onChange={(e) => setForm((f) => ({ ...f, iva: e.target.value }))}
            placeholder="Ej: 18"
          />
          <InputField
            label="Cargo servicios % (opcional)"
            type="number"
            min={0}
            step={0.01}
            value={form.cargo_servicios}
            onChange={(e) => setForm((f) => ({ ...f, cargo_servicios: e.target.value }))}
            placeholder="Ej: 10"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" isLoading={saving} className="flex-1">{saving ? "Guardando..." : tarifa ? "Actualizar" : "Crear"}</Button>
        </div>
      </form>
    </Modal>
  );
}
