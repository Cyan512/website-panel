import { useState, useEffect } from "react";
import { useInventory } from "../hooks/useInventory";
import type { UpdateMuebleDto, Mueble, MuebleCategoria, MuebleCondicion } from "../types";
import { MuebleCategoria as MuebleCategoriaEnum, MuebleCondicion as MuebleCondicionEnum } from "../types";
import { Modal, Button } from "@/components";
import { InputField } from "@/components";
import { sileo } from "sileo";

const defaultFormData = {
  codigo: "",
  nombre: "",
  categoria: MuebleCategoriaEnum.CAMA as MuebleCategoria,
  imagen_url: null as string | null,
  tipo: null as string | null,
  condicion: MuebleCondicionEnum.BUENO as MuebleCondicion,
  fecha_adquisicion: null as string | null,
  ultima_revision: null as string | null,
  descripcion: null as string | null,
};

const CATEGORIES = [
  { value: MuebleCategoriaEnum.CAMA, label: "Cama" },
  { value: MuebleCategoriaEnum.ASIENTO, label: "Asiento" },
  { value: MuebleCategoriaEnum.ALMACENAJE, label: "Almacenaje" },
  { value: MuebleCategoriaEnum.TECNOLOGIA, label: "Tecnología" },
  { value: MuebleCategoriaEnum.BANO, label: "Baño" },
  { value: MuebleCategoriaEnum.DECORACION, label: "Decoración" },
  { value: MuebleCategoriaEnum.OTRO, label: "Otro" },
];

const CONDITIONS = [
  { value: MuebleCondicionEnum.BUENO, label: "Bueno" },
  { value: MuebleCondicionEnum.REGULAR, label: "Regular" },
  { value: MuebleCondicionEnum.DANADO, label: "Dañado" },
  { value: MuebleCondicionEnum.FALTANTE, label: "Faltante" },
];

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mueble?: Mueble | null;
}

export function StockModal({ isOpen, onClose, onSuccess, mueble }: StockModalProps) {
  const { createMueble, updateMueble } = useInventory();
  const isEditing = !!mueble;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (mueble) {
      setFormData({
        codigo: mueble.codigo || "",
        nombre: mueble.nombre || "",
        categoria: mueble.categoria || MuebleCategoriaEnum.CAMA,
        imagen_url: mueble.imagen_url || null,
        tipo: mueble.tipo || null,
        condicion: mueble.condicion || MuebleCondicionEnum.BUENO,
        fecha_adquisicion: mueble.fecha_adquisicion || null,
        ultima_revision: mueble.ultima_revision || null,
        descripcion: mueble.descripcion || null,
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [mueble]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditing && mueble) {
        const updateData: UpdateMuebleDto = { ...formData };
        await updateMueble(mueble.id, updateData);
      } else {
        await createMueble(formData);
      }
      onSuccess();
      onClose();
    } catch {
      sileo.error({ title: "Error", description: "No se pudo guardar el mueble" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof defaultFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value || null }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar Mueble" : "Nuevo Mueble"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Código" value={formData.codigo} onChange={(e) => handleChange("codigo", e.target.value)} placeholder="Ej: MBL-001" required maxLength={30} />
          <InputField label="Nombre" value={formData.nombre} onChange={(e) => handleChange("nombre", e.target.value)} placeholder="Ej: Cama King" required maxLength={100} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="mb-2">
            <label className="field-label block mb-2 text-text-secondary font-medium">Categoría</label>
            <select value={formData.categoria} onChange={(e) => handleChange("categoria", e.target.value)} className="field-input w-full rounded-xl py-3.5 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50">
              {CATEGORIES.map((cat) => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
            </select>
          </div>
          <InputField label="Tipo" value={formData.tipo || ""} onChange={(e) => handleChange("tipo", e.target.value)} placeholder="Ej: King Size" maxLength={60} />
        </div>

        <div className="mb-2">
          <label className="field-label block mb-2 text-text-secondary font-medium">Condición</label>
          <select value={formData.condicion} onChange={(e) => handleChange("condicion", e.target.value)} className="field-input w-full rounded-xl py-3.5 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50">
            {CONDITIONS.map((cond) => <option key={cond.value} value={cond.value}>{cond.label}</option>)}
          </select>
        </div>

        <InputField label="URL Imagen" type="url" value={formData.imagen_url || ""} onChange={(e) => handleChange("imagen_url", e.target.value)} placeholder="https://..." />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField label="Fecha de Adquisición" type="date" value={formData.fecha_adquisicion || ""} onChange={(e) => handleChange("fecha_adquisicion", e.target.value)} />
          <InputField label="Última Revisión" type="date" value={formData.ultima_revision || ""} onChange={(e) => handleChange("ultima_revision", e.target.value)} />
        </div>

        <div className="mb-2">
          <label className="field-label block mb-2 text-text-secondary font-medium">Descripción</label>
          <textarea value={formData.descripcion || ""} onChange={(e) => handleChange("descripcion", e.target.value)} rows={3} className="field-input w-full rounded-xl py-3 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50 resize-none" placeholder="Descripción opcional..." />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" isLoading={loading} className="flex-1">{loading ? (isEditing ? "Guardando..." : "Creando...") : (isEditing ? "Guardar" : "Crear")}</Button>
        </div>
      </form>
    </Modal>
  );
}
