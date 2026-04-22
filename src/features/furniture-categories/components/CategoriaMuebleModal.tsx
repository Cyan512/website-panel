import { useState, useEffect } from "react";
import { Modal, Button, InputField } from "@/components";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import type { CategoriaMueble, CreateCategoriaMueble } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoria?: CategoriaMueble | null;
  onSave: (data: CreateCategoriaMueble) => Promise<CategoriaMueble>;
}

export function CategoriaMuebleModal({ isOpen, onClose, onSuccess, categoria, onSave }: Props) {
  const [form, setForm] = useState({ nombre: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (categoria) {
      setForm({ nombre: categoria.nombre });
    } else {
      setForm({ nombre: "" });
    }
  }, [categoria, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) return sileo.error({ title: "Error", description: "El nombre es requerido" });

    setSaving(true);
    try {
      await onSave({ nombre: form.nombre.trim() });
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
        <InputField label="Nombre" value={form.nombre} onChange={(e) => setForm({ nombre: e.target.value })} placeholder="Ej: Camas, Sillas..." required />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" isLoading={saving} className="flex-1">{saving ? "Guardando..." : categoria ? "Actualizar" : "Crear"}</Button>
        </div>
      </form>
    </Modal>
  );
}