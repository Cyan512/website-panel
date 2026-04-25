import { useState, useEffect, useRef } from "react";
import { Modal, Button, InputField } from "@/components";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import { MdUpload, MdClose, MdImage, MdArrowDropDown } from "react-icons/md";
import { roomsApi } from "../api";
import type { CreateHabitacion, Habitacion, UpdateHabitacion, TipoHabitacion } from "../types";

const selectClass =
  "w-full appearance-none cursor-pointer bg-bg-card rounded-xl py-3.5 text-sm px-3.5 pr-10 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50 hover:border-border transition-colors text-text-primary";
const labelClass = "field-label block mb-2 text-text-secondary font-medium";

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  habitacion?: Habitacion | null;
  tipos: TipoHabitacion[];
}

const defaultForm: CreateHabitacion = {
  nro_habitacion: "",
  tipo_habitacion_id: "",
  piso: 1,
  tiene_banio: true,
  tiene_ducha: true,
  estado: true,
  descripcion: "",
};

export function RoomModal({ isOpen, onClose, onSuccess, habitacion, tipos }: RoomModalProps) {
  const isEditing = !!habitacion;
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [tipoOpen, setTipoOpen] = useState(false);
  const [estadoOpen, setEstadoOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tipoRef = useRef<HTMLDivElement>(null);
  const estadoRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<CreateHabitacion>({ ...defaultForm });

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (tipoRef.current && !tipoRef.current.contains(e.target as Node)) setTipoOpen(false);
      if (estadoRef.current && !estadoRef.current.contains(e.target as Node)) setEstadoOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setFiles([]);
    setTipoOpen(false);
    setEstadoOpen(false);
    if (habitacion) {
      setExistingImages(habitacion.url_imagen ?? []);
      setFormData({
        nro_habitacion: habitacion.nro_habitacion,
        tipo_habitacion_id: habitacion.tipo_habitacion_id ?? habitacion.tipo_habitacion?.id ?? "",
        piso: habitacion.piso,
        tiene_banio: habitacion.tiene_banio,
        tiene_ducha: habitacion.tiene_ducha,
        estado: habitacion.estado,
        descripcion: habitacion.descripcion ?? "",
      });
    } else {
      setExistingImages([]);
      setFormData({
        ...defaultForm,
        tipo_habitacion_id: tipos[0]?.id || "",
      });
    }
  }, [isOpen, habitacion]);

  useEffect(() => {
    if (tipos.length > 0 && !formData.tipo_habitacion_id) {
      setFormData((prev) => ({ ...prev, tipo_habitacion_id: tipos[0].id }));
    }
  }, [tipos, formData.tipo_habitacion_id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...selected]);
    e.target.value = "";
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nro = formData.nro_habitacion.trim();
    if (!nro) return sileo.error({ title: "Error", description: "El número de habitación es requerido" });
    if (nro.length > 10) return sileo.error({ title: "Error", description: "El número de habitación debe tener máximo 10 caracteres" });
    if (!formData.tipo_habitacion_id) return sileo.error({ title: "Error", description: "El tipo de habitación es requerido" });
    if (formData.piso <= 0) return sileo.error({ title: "Error", description: "El piso debe ser un número positivo" });

    setLoading(true);
    try {
      if (isEditing && habitacion) {
        const updateData: UpdateHabitacion = {
          nro_habitacion: nro,
          tipo_habitacion_id: formData.tipo_habitacion_id,
          piso: formData.piso,
          tiene_banio: formData.tiene_banio,
          tiene_ducha: formData.tiene_ducha,
          estado: formData.estado,
          descripcion: formData.descripcion?.trim() || undefined,
          imagenes_existentes: existingImages,
          ...(files.length > 0 && { imagenes: files }),
        };
        await roomsApi.update(habitacion.id, updateData);
        sileo.success({ title: "Habitación actualizada", description: nro });
      } else {
        await roomsApi.create({
          ...formData,
          nro_habitacion: nro,
          descripcion: formData.descripcion?.trim() || undefined,
          imagenes: files.length > 0 ? files : undefined,
        });
        sileo.success({ title: "Habitación creada", description: nro });
      }
      onSuccess();
      onClose();
    } catch (err) {
      if (!isHandledError(err)) {
        const msg = err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
        sileo.error({ title: "Error", description: msg || "No se pudo guardar la habitación." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar Habitación" : "Nueva Habitación"} size="2xl">
      <div className="max-h-[80vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
            {/* Columna izquierda — Imagen */}
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Imágenes</label>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />

                {isEditing && existingImages.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {existingImages.map((url, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden border border-border aspect-square">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setExistingImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-danger transition-colors"
                        >
                          <MdClose className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {files.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {files.map((file, idx) => (
                      <div key={idx} className="relative rounded-xl overflow-hidden border border-border aspect-square">
                        <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-danger transition-colors"
                        >
                          <MdClose className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {existingImages.length === 0 && files.length === 0 && (
                  <div className="aspect-square rounded-xl border-2 border-dashed border-border bg-bg-card flex flex-col items-center justify-center gap-2 mb-3 text-text-muted">
                    <MdImage className="w-10 h-10" />
                    <span className="text-xs">Sin imágenes</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-text-muted hover:text-primary text-sm"
                >
                  <MdUpload className="w-5 h-5" />
                  {files.length > 0 ? `${files.length} archivo(s) seleccionado(s)` : "Seleccionar imágenes nuevas"}
                </button>
              </div>
            </div>

            {/* Columna derecha — Formulario */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label="Número de Habitación"
                  type="text"
                  value={formData.nro_habitacion}
                  onChange={(e) => setFormData({ ...formData, nro_habitacion: e.target.value })}
                  placeholder="Ej: 101"
                  required
                />
                <InputField
                  label="Piso"
                  type="number"
                  value={formData.piso}
                  onChange={(e) => setFormData({ ...formData, piso: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative" ref={tipoRef}>
                  <label className={labelClass}>Tipo de Habitación</label>
                  {tipos.length === 0 ? (
                    <div className={selectClass + " text-text-muted"}>No hay tipos disponibles</div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setTipoOpen(!tipoOpen)}
                        className={selectClass + " flex items-center justify-between text-left"}
                      >
                        <span>{tipos.find((t) => t.id === formData.tipo_habitacion_id)?.nombre || "Seleccionar"}</span>
                        <MdArrowDropDown className={`w-5 h-5 text-text-muted transition-transform ${tipoOpen ? "rotate-180" : ""}`} />
                      </button>
                      {tipoOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                          <div className="max-h-[240px] overflow-y-auto py-1">
                            {tipos.map((t) => (
                              <div
                                key={t.id}
                                className={`px-3.5 py-2.5 text-sm cursor-pointer hover:bg-primary/5 ${
                                  formData.tipo_habitacion_id === t.id ? "bg-primary/10 text-primary font-medium" : "text-text-primary"
                                }`}
                                onClick={() => {
                                  setFormData({ ...formData, tipo_habitacion_id: t.id });
                                  setTipoOpen(false);
                                }}
                              >
                                {t.nombre}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="relative" ref={estadoRef}>
                  <label className={labelClass}>Estado</label>
                  <button
                    type="button"
                    onClick={() => setEstadoOpen(!estadoOpen)}
                    className={selectClass + " flex items-center justify-between text-left"}
                  >
                    <span>{formData.estado ? "Disponible" : "No Disponible"}</span>
                    <MdArrowDropDown className={`w-5 h-5 text-text-muted transition-transform ${estadoOpen ? "rotate-180" : ""}`} />
                  </button>
                  {estadoOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                      <div className="py-1">
                        <div
                          className={`px-3.5 py-2.5 text-sm cursor-pointer hover:bg-primary/5 ${formData.estado === true ? "bg-primary/10 text-primary font-medium" : "text-text-primary"}`}
                          onClick={() => {
                            setFormData({ ...formData, estado: true });
                            setEstadoOpen(false);
                          }}
                        >
                          Disponible
                        </div>
                        <div
                          className={`px-3.5 py-2.5 text-sm cursor-pointer hover:bg-primary/5 ${formData.estado === false ? "bg-primary/10 text-primary font-medium" : "text-text-primary"}`}
                          onClick={() => {
                            setFormData({ ...formData, estado: false });
                            setEstadoOpen(false);
                          }}
                        >
                          No Disponible
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.tiene_ducha}
                    onChange={(e) => setFormData({ ...formData, tiene_ducha: e.target.checked })}
                    className="w-4 h-4 accent-primary rounded"
                  />
                  <span className="text-sm text-text-muted">Tiene ducha</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.tiene_banio}
                    onChange={(e) => setFormData({ ...formData, tiene_banio: e.target.checked })}
                    className="w-4 h-4 accent-primary rounded"
                  />
                  <span className="text-sm text-text-muted">Tiene baño completo</span>
                </label>
              </div>

              <div>
                <label className={labelClass}>Descripción (opcional)</label>
                <textarea
                  value={formData.descripcion || ""}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción de la habitación..."
                  className={selectClass + " resize-none"}
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" isLoading={loading} className="flex-1">
                  {loading ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Habitación"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
