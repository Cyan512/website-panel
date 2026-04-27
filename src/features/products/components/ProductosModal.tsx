import { useState, useEffect } from "react";
import { Modal, InputField, Button } from "@/components";
import type { Producto } from "../types";

interface ProductoFormState {
  codigo: string;
  nombre: string;
  descripcion: string;
  precio_unitario: string;
  stock: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: ProductoFormState) => Promise<void>;
  editingProducto: Producto | null;
  saving: boolean;
}

const emptyForm: ProductoFormState = {
  codigo: "",
  nombre: "",
  descripcion: "",
  precio_unitario: "",
  stock: "0",
};

function productToForm(p: Producto): ProductoFormState {
  return {
    codigo: p.codigo,
    nombre: p.nombre,
    descripcion: p.descripcion ?? "",
    precio_unitario: String(p.precio_unitario),
    stock: String(p.stock),
  };
}

export function ProductosModal({
  isOpen,
  onClose,
  onSubmit,
  editingProducto,
  saving,
}: Props) {
  const [form, setForm] = useState<ProductoFormState>(emptyForm);

  useEffect(() => {
    if (editingProducto) {
      setForm(productToForm(editingProducto));
    } else {
      setForm(emptyForm);
    }
  }, [editingProducto, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProducto ? "Editar Producto" : "Nuevo Producto"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Código *"
            value={form.codigo}
            onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
            placeholder="PROD-001"
            required
          />
          <InputField
            label="Nombre *"
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            placeholder="Nombre del producto"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Descripción</label>
          <textarea
            value={form.descripcion}
            onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
            placeholder="Descripción opcional..."
            rows={3}
            className="w-full px-3 py-2.5 text-base rounded-xl border border-border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Precio Unitario *"
            type="number"
            min="0"
            step="0.01"
            value={form.precio_unitario}
            onChange={(e) => setForm((f) => ({ ...f, precio_unitario: e.target.value }))}
            placeholder="0.00"
            required
          />
          <InputField
            label="Stock"
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
            placeholder="0"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? "Guardando..." : editingProducto ? "Guardar Cambios" : "Crear Producto"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
