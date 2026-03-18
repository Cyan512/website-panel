import { useState, useEffect } from "react";
import { useTiposHabitacion } from "../hooks/useRooms";
import type { CreateTipoHabitacionDto, UpdateTipoHabitacionDto, TipoHabitacion, TipoMueble } from "../types";
import { getMueblesService } from "@/features/inventory/hooks/useInventory";
import { Modal, Button } from "@/components";
import { InputField } from "@/components";
import { sileo } from "sileo";

interface TipoHabitacionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    tipo?: TipoHabitacion | null;
}

export function TipoHabitacionModal({ isOpen, onClose, onSuccess, tipo }: TipoHabitacionModalProps) {
    const { createTipo, updateTipo } = useTiposHabitacion();
    const isEditing = !!tipo;
    const [loading, setLoading] = useState(false);
    const [muebles, setMuebles] = useState<TipoMueble[]>([]);
    const [loadingMuebles, setLoadingMuebles] = useState(true);
    const [formData, setFormData] = useState<CreateTipoHabitacionDto>({
        nombre: "",
        descripcion: null,
        tiene_ducha: true,
        tiene_banio: false,
        muebles: [],
    });

    useEffect(() => {
        if (isOpen) {
            fetchMuebles();
            if (tipo) {
                setFormData({
                    nombre: tipo.nombre,
                    descripcion: tipo.descripcion,
                    tiene_ducha: tipo.tiene_ducha,
                    tiene_banio: tipo.tiene_banio,
                    muebles: tipo.muebles?.map((m) => m.id) || [],
                });
            } else {
                setFormData({ nombre: "", descripcion: null, tiene_ducha: true, tiene_banio: false, muebles: [] });
            }
        }
    }, [isOpen, tipo]);

    const fetchMuebles = async () => {
        setLoadingMuebles(true);
        try {
            const data = await getMueblesService.execute();
            const mueblesData = Array.isArray(data) ? data : (data as { data?: TipoMueble[] }).data || [];
            setMuebles(mueblesData);
        } catch {
            sileo.error({ title: "Error", description: "No se pudieron cargar los muebles" });
        } finally {
            setLoadingMuebles(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditing && tipo) {
                const updateData: UpdateTipoHabitacionDto = {
                    nombre: formData.nombre,
                    descripcion: formData.descripcion,
                    tiene_ducha: formData.tiene_ducha,
                    tiene_banio: formData.tiene_banio,
                    muebles: formData.muebles,
                };
                await updateTipo(tipo.id, updateData);
            } else {
                await createTipo(formData);
            }
            onSuccess();
            onClose();
        } catch {
            sileo.error({ title: "Error", description: "No se pudo guardar el tipo de habitación" });
        } finally {
            setLoading(false);
        }
    };

    const toggleMueble = (muebleId: string) => {
        setFormData((prev) => ({
            ...prev,
            muebles: prev.muebles?.includes(muebleId)
                ? prev.muebles.filter((id) => id !== muebleId)
                : [...(prev.muebles || []), muebleId],
        }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar Tipo de Habitación" : "Nuevo Tipo de Habitación"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <InputField
                    label="Nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Suite Deluxe"
                    required
                />

                <div className="mb-5">
                    <label className="field-label block mb-2 text-text-secondary font-medium">Descripción (opcional)</label>
                    <textarea
                        value={formData.descripcion || ""}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value || null })}
                        placeholder="Descripción del tipo de habitación..."
                        className="field-input w-full rounded-xl py-3.5 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50 resize-none"
                        rows={3}
                    />
                </div>

                <div className="flex gap-4 mb-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.tiene_ducha}
                            onChange={(e) => setFormData({ ...formData, tiene_ducha: e.target.checked })}
                            className="w-4 h-4 text-accent-primary rounded border-border-light focus:ring-accent-primary"
                        />
                        <span className="text-sm text-text-muted">Tiene ducha</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.tiene_banio}
                            onChange={(e) => setFormData({ ...formData, tiene_banio: e.target.checked })}
                            className="w-4 h-4 text-accent-primary rounded border-border-light focus:ring-accent-primary"
                        />
                        <span className="text-sm text-text-muted">Tiene baño completo</span>
                    </label>
                </div>

                <div className="mb-5">
                    <label className="field-label block mb-2 text-text-secondary font-medium">Muebles (opcional)</label>
                    {loadingMuebles ? (
                        <div className="field-input w-full rounded-xl py-3.5 px-3.5 bg-paper-medium/20 text-text-muted">Cargando muebles...</div>
                    ) : (
                        <div className="border border-border-light/50 rounded-xl p-3 max-h-48 overflow-y-auto">
                            {muebles.length === 0 ? (
                                <p className="text-text-muted text-sm text-center py-2">No hay muebles disponibles</p>
                            ) : (
                                <div className="space-y-2">
                                    {muebles.map((mueble) => (
                                        <label key={mueble.id} className="flex items-center gap-2 cursor-pointer hover:bg-paper-medium/20 p-2 rounded-lg transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={formData.muebles?.includes(mueble.id) || false}
                                                onChange={() => toggleMueble(mueble.id)}
                                                className="w-4 h-4 text-accent-primary rounded border-border-light focus:ring-accent-primary"
                                            />
                                            <div className="flex-1">
                                                <span className="text-sm text-text-muted">{mueble.nombre}</span>
                                                <span className="text-xs text-text-muted ml-2">({mueble.codigo})</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    <p className="text-xs text-text-muted mt-1">{formData.muebles?.length || 0} muebles seleccionados</p>
                </div>

                <div className="flex gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
                    <Button type="submit" isLoading={loading} className="flex-1">
                        {loading ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Tipo"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
