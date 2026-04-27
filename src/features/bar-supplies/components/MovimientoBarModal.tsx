import { useState, useEffect } from "react";
import { Modal, InputField, Button } from "@/components";
import { TipoMovimiento, MotivoEntrada, MotivoSalida } from "../types";
import type { InsumoBar } from "../types";

interface MovForm {
  tipo: TipoMovimiento;
  cantidad: string;
  motivo_entrada: MotivoEntrada | "";
  motivo_salida: MotivoSalida | "";
  notas: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (form: MovForm) => Promise<void>;
  insumo: InsumoBar | null;
  saving: boolean;
}

const selectClass =
  "w-full rounded-xl py-3 text-sm px-3.5 border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30";
const labelClass = "block text-sm font-medium text-text-primary mb-1";

const emptyForm: MovForm = {
  tipo: TipoMovimiento.Entrada,
  cantidad: "",
  motivo_entrada: MotivoEntrada.Compra,
  motivo_salida: "",
  notas: "",
};

export function MovimientoBarModal({ isOpen, onClose, onSubmit, insumo, saving }: Props) {
  const [form, setForm] = useState<MovForm>(emptyForm);

  useEffect(() => {
    if (isOpen) {
      setForm(emptyForm);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Movimiento · ${insumo?.nombre ?? ""}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Tipo</label>
            <select
              value={form.tipo}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  tipo: e.target.value as TipoMovimiento,
                  motivo_entrada: MotivoEntrada.Compra,
                  motivo_salida: "",
                }))
              }
              className={selectClass}
            >
              <option value={TipoMovimiento.Entrada}>Entrada</option>
              <option value={TipoMovimiento.Salida}>Salida</option>
            </select>
          </div>
          <InputField
            label="Cantidad *"
            type="number"
            min="0.01"
            step="0.01"
            value={form.cantidad}
            onChange={(e) => setForm((f) => ({ ...f, cantidad: e.target.value }))}
            placeholder="0"
            required
          />
        </div>

        {form.tipo === TipoMovimiento.Entrada ? (
          <div>
            <label className={labelClass}>Motivo de entrada</label>
            <select
              value={form.motivo_entrada}
              onChange={(e) =>
                setForm((f) => ({ ...f, motivo_entrada: e.target.value as MotivoEntrada }))
              }
              className={selectClass}
            >
              {Object.values(MotivoEntrada).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className={labelClass}>Motivo de salida</label>
            <select
              value={form.motivo_salida}
              onChange={(e) =>
                setForm((f) => ({ ...f, motivo_salida: e.target.value as MotivoSalida }))
              }
              className={selectClass}
            >
              <option value="">Sin motivo</option>
              {Object.values(MotivoSalida).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        )}

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

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" isLoading={saving} className="flex-1">
            {saving ? "Registrando..." : "Registrar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export type { MovForm };
