import { useState, useEffect } from "react";
import { useTiposHabitacion } from "../hooks/useRooms";
import type { CreateTipoHabitacion, UpdateTipoHabitacion, TipoHabitacion } from "../types";
import { Modal, Button } from "@/components";
import { InputField } from "@/components";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";

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
    const [formData, setFormData] = useState<CreateTipoHabitacion>({
        nombre: "",
        descripcion: null,
        muebles: [],
    });

    useEffect(() => {
        if (isOpen) {
            if (tipo) {
                setFormData({
                    nombre: tipo.nombre,
                    descripcion: tipo.descripcion,
                });
            } else {
                setFormData({ nombre: "", descripcion: null });
            }
        }
    }, [isOpen, tipo]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditing && tipo) {
                const updateData: UpdateTipoHabitacion = {
                    nombre: formData.nombre,
                    descripcion: formData.descripcion,
                };
                await updateTipo(tipo.id, updateData);
            } else {
                await createTipo(formData);
            }
            onSuccess();
            onClose();
        } catch (err) {
            if (!isHandledError(err)) { sileo.error({ title: "Error", description: "No se pudo guardar el tipo de habitación" }); }
        } finally {
            setLoading(false);
        }
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
