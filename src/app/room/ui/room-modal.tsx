import { useState } from "react";
import { createHabitacionService } from "@/app/room/app/services/create-habitacion.service";
import type { CreateHabitacionDto } from "@/app/room/dom/CreateHabitacionDto";
import type { HabitationType } from "@/app/room/dom/HabitacionType";
import { Modal, Button } from "@/app/shared/components/ui";
import { InputField } from "@/app/shared/components/input";

interface RoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const ROOM_TYPES: { value: HabitationType; label: string }[] = [
    { value: "ESTÁNDAR SIMPLE", label: "Estándar Simple" },
    { value: "ESTÁNDAR DOBLE", label: "Estándar Doble" },
    { value: "SUITE", label: "Suite" },
    { value: "SUITE JUNIOR", label: "Suite Junior" },
];

export function RoomModal({ isOpen, onClose, onSuccess }: RoomModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateHabitacionDto>({
        numero: "",
        piso: 1,
        tipo: "ESTÁNDAR SIMPLE",
        precio: 0,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createHabitacionService.execute(formData);
            onSuccess();
            onClose();
            setFormData({ numero: "", piso: 1, tipo: "ESTÁNDAR SIMPLE", precio: 0 });
        } catch (error) {
            console.error("Error creating room:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Nueva Habitación"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <InputField
                    label="Número"
                    type="text"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
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
                    <select
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value as HabitationType })}
                        className="field-input w-full rounded-xl py-3.5 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50"
                    >
                        {ROOM_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                <InputField
                    label="Precio por Noche (S/)"
                    type="number"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: Number(e.target.value) })}
                    placeholder="0"
                    required
                />

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
