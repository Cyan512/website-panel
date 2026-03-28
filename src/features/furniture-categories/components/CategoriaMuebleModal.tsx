import { useState, useEffect } from "react";
import { Modal, Button, InputField } from "@/components";
import { sileo } from "sileo";
import { isHandledError } from "@/utils/error.utils";
import type { CategoriaMueble, CreateCategoriaMueble } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoria?: CategoriaMueble | null;
  onSave: (data: CreateCategoriaMueble) => Promise<CategoriaMueble>;
}

const labelClass = "field-label block mb-2 text-text-secondary font-medium";

export function CategoriaMuebleModal({ isOpen, onClose, onSuccess, categoria, onSave }: Props) {
  const [form, setForm] = useState({ nombre: "", descripcion: "", activo: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (categoria) {
      setForm({ nombre: categoria.nombre, descripcion: categoria.descripcion ?? "", activo: categoria.activo });
    } else {
      setForm({ nombre: "", descripcion: "", activo: true });
    }
  }, [categoria, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) return sileo.error({ title: "Error", description: "El nombre es requerido" });

    setSaving(true);
    try {
      await onSave({
        nombre: form.nombre.trim(),
        activo: form.activo,
        ...(form.descripcion.trim() && { descripcion: form.descripcion.trim() }),
      });
      sileo.success({ title: categoria ? "Categoría actualizada" : "Categoría creada", description: form.nombre });
      onSuccess();
      onClose();
    } catch (err) {
      if (!isHandledError(err)) { sileo.error({ title: "Error", description: "No se pudo guardar la categoría" }); }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={categoria ? "Editar Categoría" : "Nueva Categoría"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField label="Nombre" value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Camas, Sillas..." required />

        <div>
          <label className={labelClass}>Descripción (opcional)</label>
          <textarea value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} rows={2} className="field-input w-full rounded-xl py-3 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50 resize-none" placeholder="Descripción de la categoría..." />
        </div>

        <div className="flex items-center gap-2">
          <input id="activo" type="checkbox" checked={form.activo} onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))} className="w-4 h-4 accent-primary" />
          <label htmlFor="activo" className="text-sm text-text-primary">Categoría activa</label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" isLoading={saving} className="flex-1">{saving ? "Guardando..." : categoria ? "Actualizar" : "Crear"}</Button>
        </div>
      </form>
    </Modal>
  );
}
