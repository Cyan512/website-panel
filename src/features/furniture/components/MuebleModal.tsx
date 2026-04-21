import { useState, useEffect, useRef } from "react";
import { Modal, Button, InputField } from "@/components";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import { muebleConditionLabels } from "../types";
import type { Mueble, CreateMueble, MuebleCondition } from "../types";
import type { Habitacion } from "@/features/rooms/types";
import type { CategoriaMueble } from "@/features/furniture-categories/types";
import { MdUpload, MdClose } from "react-icons/md";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mueble?: Mueble | null;
  categorias: CategoriaMueble[];
  habitaciones: Habitacion[];
  onSave: (data: CreateMueble) => Promise<Mueble>;
}

const selectClass = "field-input w-full rounded-xl py-3.5 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50";
const labelClass = "field-label block mb-2 text-text-secondary font-medium";

const defaultForm = {
  codigo: "",
  nombre: "",
  descripcion: "",
  categoria_id: "",
  condicion: "BUENO" as MuebleCondition,
  fecha_adquisicion: "",
  ultima_revision: "",
  habitacion_id: "",
};

export function MuebleModal({ isOpen, onClose, onSuccess, mueble, categorias, habitaciones, onSave }: Props) {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mueble) {
      setForm({
        codigo: mueble.codigo,
        nombre: mueble.nombre,
        descripcion: mueble.descripcion ?? "",
        categoria_id: mueble.categoria_id,
        condicion: mueble.condicion as MuebleCondition,
        fecha_adquisicion: mueble.fecha_adquisicion ?? "",
        ultima_revision: mueble.ultima_revision ?? "",
        habitacion_id: mueble.habitacion_id ?? "",
      });
      setImageFiles([]);
    } else {
      setForm({ ...defaultForm, categoria_id: categorias[0]?.id ?? "", habitacion_id: habitaciones[0]?.id ?? "" });
      setImageFiles([]);
    }
  }, [mueble, isOpen, categorias, habitaciones]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.codigo.trim()) return sileo.error({ title: "Error", description: "El código es requerido" });
    if (!form.nombre.trim()) return sileo.error({ title: "Error", description: "El nombre es requerido" });
    if (!form.categoria_id) return sileo.error({ title: "Error", description: "Selecciona una categoría" });
    if (!form.habitacion_id) return sileo.error({ title: "Error", description: "Selecciona una habitación" });

    const payload: CreateMueble = {
      codigo: form.codigo.trim(),
      nombre: form.nombre.trim(),
      categoria_id: form.categoria_id,
      habitacion_id: form.habitacion_id,
      condicion: form.condicion,
      ...(form.descripcion.trim() && { descripcion: form.descripcion.trim() }),
      ...(imageFiles.length > 0 && { imagen: imageFiles }),
      ...(form.fecha_adquisicion && { fecha_adquisicion: form.fecha_adquisicion }),
      ...(form.ultima_revision && { ultima_revision: form.ultima_revision }),
    };

    setSaving(true);
    try {
      await onSave(payload);
      sileo.success({ title: mueble ? "Mueble actualizado" : "Mueble creado", description: payload.nombre });
      onSuccess();
      onClose();
    } catch (err) {
      if (!isHandledError(err)) { sileo.error({ title: "Error", description: "No se pudo guardar el mueble" }); }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mueble ? "Editar Mueble" : "Nuevo Mueble"} size="lg">
      <div className="max-h-[70vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Código" value={form.codigo} onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))} placeholder="Ej: MBL-001" required />
          <InputField label="Nombre" value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Cama King" required />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Categoría</label>
            <select value={form.categoria_id} onChange={(e) => setForm((f) => ({ ...f, categoria_id: e.target.value }))} className={selectClass} required>
              <option value="">Seleccionar...</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Habitación</label>
            <select value={form.habitacion_id} onChange={(e) => setForm((f) => ({ ...f, habitacion_id: e.target.value }))} className={selectClass} required>
              <option value="">Seleccionar...</option>
              {habitaciones.map((h) => <option key={h.id} value={h.id}>Hab. {h.nro_habitacion} — Piso {h.piso}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Condición</label>
          <select value={form.condicion} onChange={(e) => setForm((f) => ({ ...f, condicion: e.target.value as MuebleCondition }))} className={selectClass}>
            {Object.entries(muebleConditionLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Descripción (opcional)</label>
          <textarea value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} rows={2} className="field-input w-full rounded-xl py-3 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50 resize-none" placeholder="Descripción del mueble..." />
        </div>

        {/* Imagen */}
        <div>
          <label className={labelClass}>Imagen (opcional)</label>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => setImageFiles(Array.from(e.target.files ?? []))} />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-text-muted hover:text-primary text-sm">
            <MdUpload className="w-5 h-5" />
            {imageFiles.length > 0 ? `${imageFiles.length} archivo(s) seleccionado(s)` : "Seleccionar imagen"}
          </button>
          {imageFiles.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {imageFiles.map((f, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden border border-border aspect-square">
                  <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImageFiles((prev) => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white hover:bg-danger transition-colors">
                    <MdClose className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {mueble?.imagen_url && imageFiles.length === 0 && (
            <div className="mt-2 rounded-xl overflow-hidden border border-border aspect-video">
              <img src={mueble.imagen_url} alt="Imagen actual" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Fecha adquisición (opcional)" type="date" value={form.fecha_adquisicion} onChange={(e) => setForm((f) => ({ ...f, fecha_adquisicion: e.target.value }))} />
          <InputField label="Última revisión (opcional)" type="date" value={form.ultima_revision} onChange={(e) => setForm((f) => ({ ...f, ultima_revision: e.target.value }))} />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" isLoading={saving} className="flex-1">{saving ? "Guardando..." : mueble ? "Actualizar" : "Crear"}</Button>
        </div>
      </form>
      </div>
    </Modal>
  );
}
