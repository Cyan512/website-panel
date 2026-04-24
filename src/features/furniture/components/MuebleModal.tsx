import { useState, useEffect, useRef } from "react";
import { Modal, Button, InputField } from "@/components";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import { muebleConditionLabels } from "../types";
import type { Mueble, CreateMueble, MuebleCondition, CategoriaMueble } from "../types";
import type { Habitacion } from "@/features/rooms/types";
import { MdUpload, MdClose, MdImage, MdArrowDropDown } from "react-icons/md";
import { mueblesApi } from "../api";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mueble?: Mueble | null;
  habitaciones: Habitacion[];
  categorias: CategoriaMueble[];
}

const selectClass =
  "w-full appearance-none cursor-pointer bg-bg-card rounded-xl py-3.5 text-sm px-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50 hover:border-border transition-colors text-text-primary";
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

export function MuebleModal({ isOpen, onClose, onSuccess, mueble, habitaciones, categorias }: Props) {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [categoriaOpen, setCategoriaOpen] = useState(false);
  const [condicionOpen, setCondicionOpen] = useState(false);
  const [habitacionOpen, setHabitacionOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoriaRef = useRef<HTMLDivElement>(null);
  const condicionRef = useRef<HTMLDivElement>(null);
  const habitacionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (categoriaRef.current && !categoriaRef.current.contains(e.target as Node)) setCategoriaOpen(false);
      if (condicionRef.current && !condicionRef.current.contains(e.target as Node)) setCondicionOpen(false);
      if (habitacionRef.current && !habitacionRef.current.contains(e.target as Node)) setHabitacionOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (mueble) {
      setForm({
        codigo: mueble.codigo,
        nombre: mueble.nombre,
        descripcion: mueble.descripcion ?? "",
        categoria_id: mueble.categoria_id ?? mueble.categoria?.id ?? "",
        condicion: (mueble.condicion as MuebleCondition) || "BUENO",
        fecha_adquisicion: mueble.fecha_adquisicion ?? "",
        ultima_revision: mueble.ultima_revision ?? "",
        habitacion_id: mueble.habitacion_id ?? "",
      });
      setImageFiles([]);
      setRemoveExistingImage(false);
    } else {
      setForm(defaultForm);
      setImageFiles([]);
      setRemoveExistingImage(false);
    }
  }, [mueble, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.codigo.trim()) return sileo.error({ title: "Error", description: "El código es requerido" });
    if (!form.nombre.trim()) return sileo.error({ title: "Error", description: "El nombre es requerido" });

    const payload: CreateMueble & { remove_imagen?: boolean } = {
      codigo: form.codigo.trim(),
      nombre: form.nombre.trim(),
      ...(form.categoria_id && { categoria_id: form.categoria_id }),
      ...(form.habitacion_id && { habitacion_id: form.habitacion_id }),
      ...(form.condicion && { condicion: form.condicion }),
      ...(form.descripcion.trim() && { descripcion: form.descripcion.trim() }),
      ...(imageFiles.length > 0 && { imagen: imageFiles }),
      ...(mueble && removeExistingImage && imageFiles.length === 0 && { remove_imagen: true }),
      ...(form.fecha_adquisicion && { fecha_adquisicion: form.fecha_adquisicion }),
      ...(form.ultima_revision && { ultima_revision: form.ultima_revision }),
    };

    setSaving(true);
    try {
      if (mueble) {
        await mueblesApi.update(mueble.id, payload);
        sileo.success({ title: "Mueble actualizado", description: payload.nombre });
      } else {
        await mueblesApi.create(payload);
        sileo.success({ title: "Mueble creado", description: payload.nombre });
      }
      onSuccess();
      onClose();
    } catch (err) {
      if (!isHandledError(err)) {
        sileo.error({ title: "Error", description: "No se pudo guardar el mueble" });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mueble ? "Editar Mueble" : "Nuevo Mueble"} size="2xl">
      <div className="max-h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
            {/* Columna izquierda — Imagen */}
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Imagen</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    setImageFiles(Array.from(e.target.files ?? []));
                    setRemoveExistingImage(false);
                  }}
                />

                {/* Imagen actual */}
                {mueble?.url_imagen && !removeExistingImage && imageFiles.length === 0 && (
                  <div className="relative rounded-xl overflow-hidden border border-border aspect-square mb-3">
                    <img src={mueble.url_imagen} alt="Imagen actual" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setRemoveExistingImage(true)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-danger transition-colors"
                      title="Quitar imagen actual"
                    >
                      <MdClose className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Preview de nueva imagen (ocupa todo el placeholder) */}
                {imageFiles.length > 0 && (
                  <div className="relative rounded-xl overflow-hidden border border-border aspect-square mb-3">
                    <img src={URL.createObjectURL(imageFiles[0])} alt="Nueva imagen" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFiles([]);
                        setRemoveExistingImage(true);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-danger transition-colors"
                      title="Quitar imagen"
                    >
                      <MdClose className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Placeholder vacío (siempre visible si no hay imagen ni preview) */}
                {imageFiles.length === 0 && (!mueble?.url_imagen || removeExistingImage) && (
                  <div className="aspect-square rounded-xl border-2 border-dashed border-border bg-bg-card flex flex-col items-center justify-center gap-2 mb-3 text-text-muted">
                    <MdImage className="w-10 h-10" />
                    <span className="text-xs">Sin imagen</span>
                  </div>
                )}

                {/* Botón seleccionar imagen */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-text-muted hover:text-primary text-sm"
                >
                  <MdUpload className="w-5 h-5" />
                  {imageFiles.length > 0 ? `${imageFiles.length} archivo(s) seleccionado(s)` : "Seleccionar imagen"}
                </button>
              </div>
            </div>

            {/* Columna derecha — Formulario */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Código"
                  value={form.codigo}
                  onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
                  placeholder="Ej: MBL-001"
                  required
                />
                <InputField
                  label="Nombre"
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej: Cama King"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative" ref={categoriaRef}>
                  <label className={labelClass}>Categoría (opcional)</label>
                  <button
                    type="button"
                    onClick={() => setCategoriaOpen(!categoriaOpen)}
                    className={selectClass + " flex items-center justify-between text-left"}
                  >
                    <span>{form.categoria_id ? (categorias.find((c) => c.id === form.categoria_id)?.nombre ?? "") : "Sin categoría"}</span>
                    <MdArrowDropDown className={`w-5 h-5 text-text-muted transition-transform ${categoriaOpen ? "rotate-180" : ""}`} />
                  </button>
                  {categoriaOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                      <div className="max-h-60 overflow-y-auto py-1">
                        <div
                          className={`px-3.5 py-2.5 text-sm cursor-pointer hover:bg-primary/5 ${!form.categoria_id ? "bg-primary/10 text-primary font-medium" : "text-text-muted"}`}
                          onClick={() => {
                            setForm((f) => ({ ...f, categoria_id: "" }));
                            setCategoriaOpen(false);
                          }}
                        >
                          Sin categoría
                        </div>
                        {categorias.map((c) => (
                          <div
                            key={c.id}
                            className={`px-3.5 py-2.5 text-sm cursor-pointer hover:bg-primary/5 ${form.categoria_id === c.id ? "bg-primary/10 text-primary font-medium" : "text-text-primary"}`}
                            onClick={() => {
                              setForm((f) => ({ ...f, categoria_id: c.id }));
                              setCategoriaOpen(false);
                            }}
                          >
                            {c.nombre}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative" ref={condicionRef}>
                  <label className={labelClass}>Condición</label>
                  <button
                    type="button"
                    onClick={() => setCondicionOpen(!condicionOpen)}
                    className={selectClass + " flex items-center justify-between text-left"}
                  >
                    <span>{muebleConditionLabels[form.condicion]}</span>
                    <MdArrowDropDown className={`w-5 h-5 text-text-muted transition-transform ${condicionOpen ? "rotate-180" : ""}`} />
                  </button>
                  {condicionOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                      <div className="py-1">
                        {Object.entries(muebleConditionLabels).map(([key, label]) => (
                          <div
                            key={key}
                            className={`px-3.5 py-2.5 text-sm cursor-pointer hover:bg-primary/5 ${form.condicion === key ? "bg-primary/10 text-primary font-medium" : "text-text-primary"}`}
                            onClick={() => {
                              setForm((f) => ({ ...f, condicion: key as MuebleCondition }));
                              setCondicionOpen(false);
                            }}
                          >
                            {label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative" ref={habitacionRef}>
                  <label className={labelClass}>Habitación (opcional)</label>
                  <button
                    type="button"
                    onClick={() => setHabitacionOpen(!habitacionOpen)}
                    className={selectClass + " flex items-center justify-between text-left"}
                  >
                    <span>
                      {form.habitacion_id
                        ? `Hab. ${habitaciones.find((h) => h.id === form.habitacion_id)?.nro_habitacion ?? ""} — Piso ${habitaciones.find((h) => h.id === form.habitacion_id)?.piso ?? ""}`
                        : "Sin habitación"}
                    </span>
                    <MdArrowDropDown className={`w-5 h-5 text-text-muted transition-transform ${habitacionOpen ? "rotate-180" : ""}`} />
                  </button>
                  {habitacionOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                      <div className="max-h-60 overflow-y-auto py-1">
                        <div
                          className={`px-3.5 py-2.5 text-sm cursor-pointer hover:bg-primary/5 ${!form.habitacion_id ? "bg-primary/10 text-primary font-medium" : "text-text-muted"}`}
                          onClick={() => {
                            setForm((f) => ({ ...f, habitacion_id: "" }));
                            setHabitacionOpen(false);
                          }}
                        >
                          Sin habitación
                        </div>
                        {habitaciones.map((h) => (
                          <div
                            key={h.id}
                            className={`px-3.5 py-2.5 text-sm cursor-pointer hover:bg-primary/5 ${form.habitacion_id === h.id ? "bg-primary/10 text-primary font-medium" : "text-text-primary"}`}
                            onClick={() => {
                              setForm((f) => ({ ...f, habitacion_id: h.id }));
                              setHabitacionOpen(false);
                            }}
                          >
                            Hab. {h.nro_habitacion} — Piso {h.piso}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className={labelClass}>Descripción (opcional)</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                  rows={3}
                  className="field-input w-full rounded-xl py-3 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50 resize-none"
                  placeholder="Descripción del mueble..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Fecha adquisición (opcional)"
                  type="date"
                  value={form.fecha_adquisicion}
                  onChange={(e) => setForm((f) => ({ ...f, fecha_adquisicion: e.target.value }))}
                />
                <InputField
                  label="Última revisión (opcional)"
                  type="date"
                  value={form.ultima_revision}
                  onChange={(e) => setForm((f) => ({ ...f, ultima_revision: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 mt-4 border-t border-border-light/30">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" isLoading={saving} className="flex-1">
              {saving ? "Guardando..." : mueble ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
