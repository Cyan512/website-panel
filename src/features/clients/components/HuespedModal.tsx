import { useState, useEffect } from "react";
import { useHuespedes } from "../hooks/useHuespedes";
import type { CreateHuespedDto, UpdateHuespedDto, Huesped, NivelVip } from "../types";
import { Modal, Button } from "@/components";
import { InputField } from "@/components";
import { sileo } from "sileo";

const defaultFormData = {
  nombres: "",
  apellidos: "",
  email: "",
  telefono: "",
  nacionalidad: "",
  nivel_vip: 0,
  notas: "",
};

const NIVEL_VIP_OPTIONS = [
  { value: 0, label: "Normal" },
  { value: 1, label: "VIP" },
  { value: 2, label: "VVIP" },
];

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
        nombres: huesped.nombres || "",
        apellidos: huesped.apellidos || "",
        email: huesped.email || "",
        telefono: huesped.telefono || "",
        nacionalidad: huesped.nacionalidad || "",
        nivel_vip: typeof huesped.nivel_vip === 'number' ? huesped.nivel_vip : 0,
        notas: huesped.notas || "",
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [huesped]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const nivelVipValue: NivelVip = formData.nivel_vip as NivelVip;
      
      if (isEditing && huesped) {
        const updateData: UpdateHuespedDto = {
          nombres: formData.nombres.trim(),
          apellidos: formData.apellidos.trim(),
          email: formData.email.trim(),
          telefono: formData.telefono.trim(),
          nacionalidad: formData.nacionalidad.trim(),
          nivel_vip: nivelVipValue,
          notas: formData.notas.trim() || undefined,
        };
        await updateHuesped(huesped.id, updateData);
      } else {
        const createData: CreateHuespedDto = {
          nombres: formData.nombres.trim(),
          apellidos: formData.apellidos.trim(),
          email: formData.email.trim(),
          telefono: formData.telefono.trim(),
          nacionalidad: formData.nacionalidad.trim(),
          nivel_vip: nivelVipValue,
          notas: formData.notas.trim() || undefined,
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Nombres" value={formData.nombres} onChange={(e) => handleChange("nombres", e.target.value)} placeholder="Ej: Juan Carlos" required maxLength={80} />
          <InputField label="Apellidos" value={formData.apellidos} onChange={(e) => handleChange("apellidos", e.target.value)} placeholder="Ej: Pérez García" required maxLength={80} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Email" type="email" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="correo@ejemplo.com" required maxLength={120} />
          <InputField label="Teléfono" value={formData.telefono} onChange={(e) => handleChange("telefono", e.target.value)} placeholder="Ej: +51987654321" required maxLength={20} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Nacionalidad" value={formData.nacionalidad} onChange={(e) => handleChange("nacionalidad", e.target.value)} placeholder="Ej: Perú" required maxLength={60} />
          <div className="mb-2">
            <label className="field-label block mb-2 text-text-secondary font-medium">Nivel VIP</label>
            <select value={formData.nivel_vip} onChange={(e) => handleChange("nivel_vip", Number(e.target.value))} className="field-input w-full rounded-xl py-3.5 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50">
              {NIVEL_VIP_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        <div className="mb-2">
          <label className="field-label block mb-2 text-text-secondary font-medium">Notas</label>
          <textarea value={formData.notas || ""} onChange={(e) => handleChange("notas", e.target.value)} rows={3} className="field-input w-full rounded-xl py-3 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50 resize-none" placeholder="Notas adicionales sobre el huésped..." />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" isLoading={loading} className="flex-1">{loading ? (isEditing ? "Guardando..." : "Creando...") : (isEditing ? "Guardar" : "Crear")}</Button>
        </div>
      </form>
    </Modal>
  );
}
