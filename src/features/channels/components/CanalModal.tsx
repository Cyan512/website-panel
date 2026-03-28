import { useState, useEffect } from "react";
import { Modal, Button, InputField } from "@/components";
import { sileo } from "sileo";
import { isHandledError } from "@/utils/error.utils";
import { tipoCanalLabels } from "../types";
import type { CanalOutput, CreateCanalInput, TipoCanal } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  canal?: CanalOutput | null;
  onSave: (data: CreateCanalInput) => Promise<CanalOutput>;
}

const defaultForm = {
  nombre: "",
  tipo: "DIRECTO" as TipoCanal,
  activo: true,
  notas: "",
};

const selectClass = "field-input w-full rounded-xl py-3.5 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50";
const labelClass = "field-label block mb-2 text-text-secondary font-medium";

export function CanalModal({ isOpen, onClose, onSuccess, canal, onSave }: Props) {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (canal) {
      setForm({ nombre: canal.nombre, tipo: canal.tipo, activo: canal.activo, notas: canal.notas ?? "" });
    } else {
      setForm(defaultForm);
    }
  }, [canal, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) return sileo.error({ title: "Error", description: "El nombre es requerido" });

    const payload: CreateCanalInput = {
      nombre: form.nombre.trim(),
      tipo: form.tipo,
      activo: form.activo,
      ...(form.notas.trim() && { notas: form.notas.trim() }),
    };

    setSaving(true);
    try {
      await onSave(payload);
      sileo.success({ title: canal ? "Canal actualizado" : "Canal creado", description: payload.nombre });
      onSuccess();
      onClose();
    } catch (err) {
      if (!isHandledError(err)) { sileo.error({ title: "Error", description: "No se pudo guardar el canal" }); }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={canal ? "Editar Canal" : "Nuevo Canal"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Nombre"
          value={form.nombre}
          onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
          placeholder="Ej: Booking.com"
          required
        />

        <div>
          <label className={labelClass}>Tipo</label>
          <select value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as TipoCanal }))} className={selectClass}>
            {Object.entries(tipoCanalLabels).map(([key, label]) => (
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

        <div className="flex items-center gap-2">
          <input
            id="activo"
            type="checkbox"
            checked={form.activo}
            onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))}
            className="w-4 h-4 accent-primary"
          />
          <label htmlFor="activo" className="text-sm text-text-primary">Canal activo</label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" isLoading={saving} className="flex-1">{saving ? "Guardando..." : canal ? "Actualizar" : "Crear"}</Button>
        </div>
      </form>
    </Modal>
  );
}
