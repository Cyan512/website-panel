import { useState, useEffect } from "react";
import { useHuespedes } from "../hooks/useHuespedes";
import type { CreateHuespedDto, UpdateHuespedDto, Huesped, TipoDocumento } from "../types";
import { Modal, Button } from "@/components";
import { InputField } from "@/components";
import { sileo } from "sileo";

const TIPO_DOC: { value: TipoDocumento; label: string }[] = [
  { value: "DNI", label: "DNI" },
  { value: "PASAPORTE", label: "Pasaporte" },
  { value: "RUC", label: "RUC" },
  { value: "CE", label: "Carné de Extranjería" },
];


const defaultFormData = {
  tipo_doc: "",
  nro_doc: "",
  nombres: "",
  apellidos: "",
  email: "",
  telefono: "",
  nacionalidad: "",
  observacion: "",
};

interface HuespedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  huesped?: Huesped | null;
}

export function HuespedModal({ isOpen, onClose, onSuccess, huesped }: HuespedModalProps) {
  const { createHuesped, updateHuesped } = useHuespedes();
  const isEditing = !!huesped;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (huesped) {
      setFormData({
        tipo_doc: huesped.tipo_doc || "",
        nro_doc: huesped.nro_doc || "",
        nombres: huesped.nombres || "",
        apellidos: huesped.apellidos || "",
        email: huesped.email || "",
        telefono: huesped.telefono || "",
        nacionalidad: huesped.nacionalidad || "",
        observacion: huesped.observacion || "",
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [huesped]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      
      if (isEditing && huesped) {
        const updateData: UpdateHuespedDto = {
          tipo_doc: formData.tipo_doc.trim(),
          nro_doc: formData.nro_doc.trim(),
          nombres: formData.nombres.trim(),
          apellidos: formData.apellidos.trim(),
          email: formData.email.trim(),
          telefono: formData.telefono.trim(),
          nacionalidad: formData.nacionalidad.trim(),
          observacion: formData.observacion.trim(),
        };
        await updateHuesped(huesped.id, updateData);
      } else {
        const createData: CreateHuespedDto = {
          tipo_doc: formData.tipo_doc.trim(),
          nro_doc: formData.nro_doc.trim(),
          nombres: formData.nombres.trim(),
          apellidos: formData.apellidos.trim(),
          email: formData.email.trim(),
          telefono: formData.telefono.trim(),
          nacionalidad: formData.nacionalidad.trim(),
          observacion: formData.observacion.trim(),
        };
        await createHuesped(createData);
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const message = error && typeof error === 'object' && 'response' in error 
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || "No se pudo guardar el huésped"
        : "No se pudo guardar el huésped";
      sileo.error({ title: "Error", description: message });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof defaultFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar Huésped" : "Nuevo Huésped"} size="lg">
      <div className="max-h-[70vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <form onSubmit={handleSubmit} className="space-y-4">

        <div className="grid grid-cols-2 gap-3">
            <div className="mb-5">
                <label className="field-label block mb-2 text-text-secondary font-medium">Tipo Documento</label>
                <select
                    value={formData.tipo_doc}
                    onChange={(e) => setFormData({ ...formData, tipo_doc: e.target.value })}
                    className="field-input w-full rounded-xl py-3.5 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50"
                >
                  <option value="">Seleccione un tipo</option>
                    {TIPO_DOC.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
          <InputField label="Número de Documento" value={formData.nro_doc} onChange={(e) => handleChange("nro_doc", e.target.value)} placeholder="Ej: 12345678" required maxLength={20} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Nombres" value={formData.nombres} onChange={(e) => handleChange("nombres", e.target.value)} placeholder="Ej: Juan Carlos" required maxLength={80} />
          <InputField label="Apellidos" value={formData.apellidos} onChange={(e) => handleChange("apellidos", e.target.value)} placeholder="Ej: Pérez García" required maxLength={80} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Email" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="correo@ejemplo.com" required maxLength={120} />
          <InputField label="Teléfono" value={formData.telefono} onChange={(e) => handleChange("telefono", e.target.value)} placeholder="Ej: +51987654321" required maxLength={20} />
        </div>

        <div>
          <InputField label="Nacionalidad" value={formData.nacionalidad} onChange={(e) => handleChange("nacionalidad", e.target.value)} placeholder="Ej: Peruana" required maxLength={50} />
        </div>

        <div className="mb-2">
          <label className="field-label block mb-2 text-text-secondary font-medium">Observaciones</label>
          <textarea value={formData.observacion || ""} onChange={(e) => handleChange("observacion", e.target.value)} rows={3} className="field-input w-full rounded-xl py-3 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50 resize-none" placeholder="Notas adicionales sobre el huésped..." />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" isLoading={loading} className="flex-1">{loading ? (isEditing ? "Guardando..." : "Creando...") : (isEditing ? "Guardar" : "Crear")}</Button>
        </div>
      </form>
      </div>
    </Modal>
  );
}
