import { useState, useEffect } from "react";
import { useHabitaciones, useTiposHabitacion } from "../hooks/useRooms";
import { Modal, Button } from "@/components";
import { InputField } from "@/components";
import { sileo } from "sileo";
import type { CreateHabitacionDto, EstadoHabitacion, EstadoLimpieza } from "../types";

const ESTADO_OPTIONS: { value: EstadoHabitacion; label: string }[] = [
    { value: "DISPONIBLE", label: "Disponible" },
    { value: "RESERVADA", label: "Reservada" },
    { value: "OCUPADA", label: "Ocupada" },
    { value: "LIMPIEZA", label: "Limpieza" },
    { value: "MANTENIMIENTO", label: "Mantenimiento" },
];

const LIMPIEZA_OPTIONS: { value: EstadoLimpieza; label: string }[] = [
    { value: "LIMPIA", label: "Limpia" },
    { value: "SUCIA", label: "Sucia" },
    { value: "EN_LIMPIEZA", label: "En Limpieza" },
    { value: "INSPECCION", label: "Inspección" },
];

interface RoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function RoomModal({ isOpen, onClose, onSuccess }: RoomModalProps) {
    const { createHabitacion } = useHabitaciones();
    const { tipos, loading: loadingTipos, fetchTipos } = useTiposHabitacion();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateHabitacionDto>({
        nro_habitacion: "",
        tipo_id: "",
        piso: 1,
        url_imagen: null,
        estado: "DISPONIBLE",
        limpieza: "LIMPIA",
        notas: null,
        muebles: [],
    });

    useEffect(() => {
        if (isOpen) {
            fetchTipos();
        }
    }, [isOpen, fetchTipos]);

    useEffect(() => {
        if (tipos.length > 0 && !formData.tipo_id) {
            setFormData(prev => ({ ...prev, tipo_id: tipos[0].id }));
        }
    }, [tipos, formData.tipo_id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createHabitacion(formData);
            onSuccess();
            onClose();
            setFormData({
                nro_habitacion: "",
                tipo_id: tipos[0]?.id || "",
                piso: 1,
                url_imagen: null,
                estado: "DISPONIBLE",
                limpieza: "LIMPIA",
                notas: null,
                muebles: [],
            });
        } catch (error) {
            let errorMessage = "No se pudo crear la habitación.";
            if (error && typeof error === "object" && "response" in error) {
                const axiosError = error as { response?: { data?: { message?: string } } };
                if (axiosError.response?.data?.message) {
                    errorMessage = axiosError.response.data.message;
                }
            }
            sileo.error({ title: "Error", description: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nueva Habitación">
            <form onSubmit={handleSubmit} className="space-y-4">
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

                <div className="mb-5">
                    <label className="field-label block mb-2 text-text-secondary font-medium">
                        Tipo de Habitación
                    </label>
                    {loadingTipos ? (
                        <div className="field-input w-full rounded-xl py-3.5 px-3.5 bg-paper-medium/20 text-text-muted">
                            Cargando tipos...
                        </div>
                    ) : (
                        <select
                            value={formData.tipo_id}
                            onChange={(e) => setFormData({ ...formData, tipo_id: e.target.value })}
                            className="field-input w-full rounded-xl py-3.5 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50"
                            required
                        >
                            {tipos.length === 0 && <option value="">No hay tipos disponibles</option>}
                            {tipos.map((tipo) => (
                                <option key={tipo.id} value={tipo.id}>
                                    {tipo.nombre}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="mb-5">
                        <label className="field-label block mb-2 text-text-secondary font-medium">Estado</label>
                        <select
                            value={formData.estado}
                            onChange={(e) => setFormData({ ...formData, estado: e.target.value as EstadoHabitacion })}
                            className="field-input w-full rounded-xl py-3.5 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50"
                        >
                            {ESTADO_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-5">
                        <label className="field-label block mb-2 text-text-secondary font-medium">Limpieza</label>
                        <select
                            value={formData.limpieza}
                            onChange={(e) => setFormData({ ...formData, limpieza: e.target.value as EstadoLimpieza })}
                            className="field-input w-full rounded-xl py-3.5 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50"
                        >
                            {LIMPIEZA_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <InputField
                    label="URL de Imagen (opcional)"
                    type="url"
                    value={formData.url_imagen || ""}
                    onChange={(e) => setFormData({ ...formData, url_imagen: e.target.value || null })}
                    placeholder="https://ejemplo.com/imagen.jpg"
                />

                <div className="mb-5">
                    <label className="field-label block mb-2 text-text-secondary font-medium">Notas (opcional)</label>
                    <textarea
                        value={formData.notas || ""}
                        onChange={(e) => setFormData({ ...formData, notas: e.target.value || null })}
                        placeholder="Notas adicionales..."
                        className="field-input w-full rounded-xl py-3.5 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50 resize-none"
                        rows={3}
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                        Cancelar
                    </Button>
                    <Button type="submit" isLoading={loading} className="flex-1">
                        {loading ? "Creando..." : "Crear Habitación"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
