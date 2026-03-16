import { useState } from "react";
import { createHabitacionUseCase } from "@/app/room/app/ports/use-cases/create-habitacion.use-case";
import type { CreateHabitacionDto } from "@/app/room/dom/CreateHabitacionDto";
import type { HabitationType } from "@/app/room/dom/HabitacionType";

interface RoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function RoomModal({ isOpen, onClose, onSuccess }: RoomModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateHabitacionDto>({
        numero: "",
        piso: 1,
        tipo: "ESTÁNDAR SIMPLE",
        precio: 0,
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createHabitacionUseCase.execute(formData);
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
        <div style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        }}>
            <div style={{
                backgroundColor: "white",
                padding: "2rem",
                borderRadius: "8px",
                width: "400px",
            }}>
                <h2>Nueva Habitación</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "1rem" }}>
                        <label>Número</label>
                        <input
                            type="text"
                            value={formData.numero}
                            onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                            required
                            style={{ width: "100%", padding: "0.5rem" }}
                        />
                    </div>
                    <div style={{ marginBottom: "1rem" }}>
                        <label>Piso</label>
                        <input
                            type="number"
                            value={formData.piso}
                            onChange={(e) => setFormData({ ...formData, piso: Number(e.target.value) })}
                            required
                            style={{ width: "100%", padding: "0.5rem" }}
                        />
                    </div>
                    <div style={{ marginBottom: "1rem" }}>
                        <label>Tipo</label>
                        <select
                            value={formData.tipo}
                            onChange={(e) => setFormData({ ...formData, tipo: e.target.value as HabitationType })}
                            style={{ width: "100%", padding: "0.5rem" }}
                        >
                            <option value="ESTÁNDAR SIMPLE">ESTÁNDAR SIMPLE</option>
                            <option value="ESTÁNDAR DOBLE">ESTÁNDAR DOBLE</option>
                            <option value="SUITE">SUITE</option>
                            <option value="SUITE JUNIOR">SUITE JUNIOR</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: "1rem" }}>
                        <label>Precio</label>
                        <input
                            type="number"
                            value={formData.precio}
                            onChange={(e) => setFormData({ ...formData, precio: Number(e.target.value) })}
                            required
                            style={{ width: "100%", padding: "0.5rem" }}
                        />
                    </div>
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, padding: "0.5rem" }}>
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} style={{ flex: 1, padding: "0.5rem" }}>
                            {loading ? "Creando..." : "Crear"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
