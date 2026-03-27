import { useState, useEffect } from "react";
import { useHabitaciones, useTiposHabitacion } from "../hooks/useRooms";
import { Modal, Button } from "@/components";
import { InputField } from "@/components";
import { sileo } from "sileo";
import { MdAdd, MdClose } from "react-icons/md";
import type { CreateHabitacionDto, EstadoHabitacion, Habitacion, UpdateHabitacionDto } from "../types";

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
    const [imageInput, setImageInput] = useState("");

    const [formData, setFormData] = useState<CreateHabitacionDto>({
        nro_habitacion: "",
        tipo_habitacion_id: "",
        piso: 1,
        tiene_banio: true,
        tiene_ducha: true,
        url_imagen: null,
        estado: "DISPONIBLE",
        notas: "",
        ulti_limpieza: "",
    });

    useEffect(() => {
        if (!isOpen) return;
        setImageInput("");
        if (habitacion) {
            setFormData({
                nro_habitacion: habitacion.nro_habitacion,
                tipo_habitacion_id: habitacion.tipo_habitacion_id,
                piso: habitacion.piso,
                tiene_banio: habitacion.tiene_banio,
                tiene_ducha: habitacion.tiene_ducha,
                url_imagen: habitacion.url_imagen,
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
                url_imagen: null,
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

    // Image list helpers
    const images = formData.url_imagen ?? [];

    const addImage = () => {
        const url = imageInput.trim();
        if (!url) return;
        setFormData((prev) => ({ ...prev, url_imagen: [...(prev.url_imagen ?? []), url] }));
        setImageInput("");
    };

    const removeImage = (idx: number) => {
        setFormData((prev) => {
            const next = (prev.url_imagen ?? []).filter((_, i) => i !== idx);
            return { ...prev, url_imagen: next.length > 0 ? next : null };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditing && habitacion) {
                const updateData: UpdateHabitacionDto = {
                    nro_habitacion: formData.nro_habitacion,
                    tipo_habitacion_id: formData.tipo_habitacion_id,
                    piso: formData.piso,
                    tiene_banio: formData.tiene_banio,
                    tiene_ducha: formData.tiene_ducha,
                    url_imagen: formData.url_imagen,
                    estado: formData.estado,
                    ulti_limpieza: formData.ulti_limpieza,
                };
                if (formData.notas && formData.notas.trim() !== '') {
                    updateData.notas = formData.notas;
                }
                await updateHabitacion(habitacion.id, updateData);
            } else {
                await createHabitacion(formData);
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

                    {/* Multi-image input */}
                    <div>
                        <label className="field-label block mb-2 text-text-secondary font-medium">Imágenes (opcional)</label>
                        <div className="flex gap-2">
                            <input
                                type="url"
                                value={imageInput}
                                onChange={(e) => setImageInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImage(); } }}
                                placeholder="https://ejemplo.com/imagen.jpg"
                                className={selectClass + " flex-1"}
                            />
                            <button type="button" onClick={addImage} className="px-3 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all">
                                <MdAdd className="w-5 h-5" />
                            </button>
                        </div>

                        {images.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {images.map((url, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-bg-tertiary/30 rounded-xl px-3 py-2 border border-border">
                                        <img src={url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-border" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                        <span className="text-xs text-text-muted truncate flex-1">{url}</span>
                                        <button type="button" onClick={() => removeImage(idx)} className="p-1 rounded-lg hover:bg-danger/10 hover:text-danger text-text-muted transition-all shrink-0">
                                            <MdClose className="w-4 h-4" />
                                        </button>
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
