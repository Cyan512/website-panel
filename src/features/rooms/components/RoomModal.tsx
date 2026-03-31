import { useState, useEffect, useRef } from "react";
import { useHabitaciones, useTiposHabitacion } from "../hooks/useRooms";
import { Modal, Button } from "@/components";
import { InputField } from "@/components";
import { sileo } from "sileo";
import { MdUpload, MdClose } from "react-icons/md";
import type { CreateHabitacion, EstadoHabitacion, Habitacion, UpdateHabitacion } from "../types";

const ESTADO_OPTIONS: { value: EstadoHabitacion; label: string }[] = [
    { value: "DISPONIBLE", label: "Disponible" },
    { value: "RESERVADA", label: "Reservada" },
    { value: "OCUPADA", label: "Ocupada" },
    { value: "LIMPIEZA", label: "Limpieza" },
    { value: "MANTENIMIENTO", label: "Mantenimiento" },
];

const selectClass = "field-input w-full rounded-xl py-3.5 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50";

interface RoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    habitacion?: Habitacion | null;
}

export function RoomModal({ isOpen, onClose, onSuccess, habitacion }: RoomModalProps) {
    const { createHabitacion, updateHabitacion } = useHabitaciones();
    const { tipos, loading: loadingTipos } = useTiposHabitacion();
    const isEditing = !!habitacion;
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<CreateHabitacion>({
        nro_habitacion: "",
        tipo_habitacion_id: "",
        piso: 1,
        tiene_banio: true,
        tiene_ducha: true,
        estado: "DISPONIBLE",
        notas: "",
        ulti_limpieza: "",
    });

    useEffect(() => {
        if (!isOpen) return;
        setFiles([]);
        if (habitacion) {
            setFormData({
                nro_habitacion: habitacion.nro_habitacion,
                tipo_habitacion_id: habitacion.tipo_habitacion_id,
                piso: habitacion.piso,
                tiene_banio: habitacion.tiene_banio,
                tiene_ducha: habitacion.tiene_ducha,
                estado: habitacion.estado,
                notas: habitacion.notas,
                ulti_limpieza: habitacion.ulti_limpieza
                    ? new Date(habitacion.ulti_limpieza).toISOString().split("T")[0]
                    : "",
            });
        } else {
            setFormData({
                nro_habitacion: "",
                tipo_habitacion_id: tipos[0]?.id || "",
                piso: 1,
                tiene_banio: true,
                tiene_ducha: true,
                estado: "DISPONIBLE",
                notas: "",
                ulti_limpieza: "",
            });
        }
    }, [isOpen, habitacion, tipos]);

    useEffect(() => {
        if (tipos.length > 0 && !formData.tipo_habitacion_id) {
            setFormData((prev) => ({ ...prev, tipo_habitacion_id: tipos[0].id }));
        }
    }, [tipos, formData.tipo_habitacion_id]);

    // File helpers
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files ?? []);
        setFiles((prev) => [...prev, ...selected]);
        e.target.value = "";
    };

    const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditing && habitacion) {
                const updateData: UpdateHabitacion = {
                    nro_habitacion: formData.nro_habitacion,
                    tipo_habitacion_id: formData.tipo_habitacion_id,
                    piso: formData.piso,
                    tiene_banio: formData.tiene_banio,
                    tiene_ducha: formData.tiene_ducha,
                    estado: formData.estado,
                    ulti_limpieza: formData.ulti_limpieza,
                    notas: formData.notas?.trim() || null,
                    ...(files.length > 0 && { imagenes: files }),
                };
                await updateHabitacion(habitacion.id, updateData);
            } else {
                await createHabitacion({ ...formData, imagenes: files.length > 0 ? files : undefined });
            }
            onSuccess();
            onClose();
        } catch (error) {
            const msg = error && typeof error === "object" && "response" in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined;
            sileo.error({ title: "Error", description: msg || "No se pudo guardar la habitación." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar Habitación" : "Nueva Habitación"}>
            <div className="max-h-[70vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="Número de Habitación" type="text" value={formData.nro_habitacion} onChange={(e) => setFormData({ ...formData, nro_habitacion: e.target.value })} placeholder="Ej: 101" required />
                        <InputField label="Piso" type="number" value={formData.piso} onChange={(e) => setFormData({ ...formData, piso: Number(e.target.value) })} required />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="field-label block mb-2 text-text-secondary font-medium">Tipo de Habitación</label>
                            {loadingTipos ? (
                                <div className={selectClass + " text-text-muted"}>Cargando tipos...</div>
                            ) : (
                                <select value={formData.tipo_habitacion_id} onChange={(e) => setFormData({ ...formData, tipo_habitacion_id: e.target.value })} className={selectClass} required>
                                    {tipos.length === 0 && <option value="">No hay tipos disponibles</option>}
                                    {tipos.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                </select>
                            )}
                        </div>
                        <div>
                            <label className="field-label block mb-2 text-text-secondary font-medium">Estado</label>
                            <select value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value as EstadoHabitacion })} className={selectClass}>
                                {ESTADO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.tiene_ducha} onChange={(e) => setFormData({ ...formData, tiene_ducha: e.target.checked })} className="w-4 h-4 accent-primary rounded" />
                            <span className="text-sm text-text-muted">Tiene ducha</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.tiene_banio} onChange={(e) => setFormData({ ...formData, tiene_banio: e.target.checked })} className="w-4 h-4 accent-primary rounded" />
                            <span className="text-sm text-text-muted">Tiene baño completo</span>
                        </label>
                    </div>

                    <div>
                        <label className="field-label block mb-2 text-text-secondary font-medium">Última Limpieza</label>
                        <input type="date" value={formData.ulti_limpieza} onChange={(e) => setFormData({ ...formData, ulti_limpieza: e.target.value })} className={selectClass + " [color-scheme:dark]"} />
                    </div>

                    <div>
                        <label className="field-label block mb-2 text-text-secondary font-medium">
                            Imágenes {isEditing ? "(reemplaza las actuales)" : "(opcional)"}
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-text-muted hover:text-primary text-sm"
                        >
                            <MdUpload className="w-5 h-5" />
                            Seleccionar imágenes
                        </button>

                        {files.length > 0 && (
                            <div className="mt-3 grid grid-cols-3 gap-2">
                                {files.map((file, idx) => (
                                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-border aspect-square bg-bg-tertiary/30">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeFile(idx)}
                                            className="absolute top-1 right-1 p-1 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <MdClose className="w-3.5 h-3.5" />
                                        </button>
                                        <p className="absolute bottom-0 left-0 right-0 text-[10px] text-white bg-black/50 px-1.5 py-0.5 truncate">{file.name}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="field-label block mb-2 text-text-secondary font-medium">Notas (opcional)</label>
                        <textarea value={formData.notas || ""} onChange={(e) => setFormData({ ...formData, notas: e.target.value })} placeholder="Notas adicionales..." className={selectClass + " resize-none"} rows={3} />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
                        <Button type="submit" isLoading={loading} className="flex-1">{loading ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Habitación"}</Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
