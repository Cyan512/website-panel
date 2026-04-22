import { useState, useEffect } from "react";
import { useTiposHabitacion } from "../hooks/useTiposHabitacion";
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
  });

  useEffect(() => {
    if (isOpen) {
      if (tipo) {
        setFormData({ nombre: tipo.nombre });
      } else {
        setFormData({ nombre: "" });
      }
    }
  }, [isOpen, tipo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing && tipo) {
        const updateData: UpdateTipoHabitacion = { nombre: formData.nombre };
        await updateTipo(tipo.id, updateData);
      } else {
        await createTipo(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      if (!isHandledError(err)) {
        sileo.error({ title: "Error", description: "No se pudo guardar el tipo de habitación" });
      }
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

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" isLoading={loading} className="flex-1">
            {loading ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Tipo"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
