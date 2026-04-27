import { useState, useEffect } from "react";
import { Modal, InputField, Button, Checkbox } from "@/components";
import { UnidadInsumo } from "../types";
import type { InsumoCocina } from "../types";

interface InsumoFormState {
  codigo: string;
  nombre: string;
  unidad: UnidadInsumo;
  stock_actual: string;
  stock_minimo: string;
  notas: string;
  activo: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: InsumoFormState) => Promise<void>;
  editingInsumo: InsumoCocina | null;
  saving: boolean;
}

const UNIDADES = Object.values(UnidadInsumo);
const selectClass =
  "w-full rounded-xl py-3 text-sm px-3.5 border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30";
const labelClass = "block text-sm font-medium text-text-primary mb-1";

const emptyForm: InsumoFormState = {
  codigo: "",
  nombre: "",
  unidad: UnidadInsumo.Unidad,
  stock_actual: "0",
  stock_minimo: "0",
  notas: "",
  activo: true,
};

function insumoToForm(i: InsumoCocina): InsumoFormState {
  return {
    codigo: i.codigo,
    nombre: i.nombre,
    unidad: i.unidad,
    stock_actual: String(i.stock_actual),
    stock_minimo: String(i.stock_minimo),
    notas: i.notas ?? "",
    activo: i.activo,
  };
}

export function InsumoCocinaModal({ isOpen, onClose, onSubmit, editingInsumo, saving }: Props) {
  const [form, setForm] = useState<InsumoFormState>(emptyForm);

  useEffect(() => {
    if (editingInsumo) {
      setForm(insumoToForm(editingInsumo));
    } else {
      setForm(emptyForm);
    }
  }, [editingInsumo, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingInsumo ? "Editar Insumo" : "Nuevo Insumo de Cocina"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Código *"
            value={form.codigo}
            onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
            placeholder="COC-001"
            required
          />
          <InputField
            label="Nombre *"
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            placeholder="Nombre del insumo"
            required
          />
        </div>
        <div>
          <label className={labelClass}>Unidad</label>
          <select
            value={form.unidad}
            onChange={(e) => setForm((f) => ({ ...f, unidad: e.target.value as UnidadInsumo }))}
            className={selectClass}
          >
            {UNIDADES.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="Stock actual"
            type="number"
            min="0"
            value={form.stock_actual}
            onChange={(e) => setForm((f) => ({ ...f, stock_actual: e.target.value }))}
            placeholder="0"
          />
          <InputField
            label="Stock mínimo"
            type="number"
            min="0"
            value={form.stock_minimo}
            onChange={(e) => setForm((f) => ({ ...f, stock_minimo: e.target.value }))}
            placeholder="0"
          />
        </div>
        <div>
          <label className={labelClass}>Notas (opcional)</label>
          <textarea
            value={form.notas}
            onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))}
            rows={2}
            className="w-full rounded-xl py-3 text-sm px-3.5 border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            placeholder="Observaciones..."
          />
        </div>
        {editingInsumo && (
          <div className="flex items-center gap-3">
            <Checkbox
              id="activo-cocina"
              size="md"
              checked={form.activo}
              onChange={(e) => setForm((f) => ({ ...f, activo: e.currentTarget.checked }))}
              label="Activo"
            />
          </div>
        )}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" isLoading={saving} className="flex-1">
            {saving ? "Guardando..." : editingInsumo ? "Actualizar" : "Crear"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export type { InsumoFormState };
