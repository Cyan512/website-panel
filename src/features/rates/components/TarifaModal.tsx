import { useState, useEffect } from "react";
import { Modal, Button, InputField } from "@/components";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import { MdAttachMoney, MdBusiness, MdHotel, MdPercent, MdAccountBalance } from "react-icons/md";
import type { Tarifa, CreateTarifa } from "../types";
import type { TipoHabitacion } from "@/features/rooms/types";
import type { Canal } from "@/features/channels/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tarifa?: Tarifa | null;
  tiposHabitacion: TipoHabitacion[];
  canales: Canal[];
  onSave: (data: CreateTarifa) => Promise<Tarifa>;
}

const defaultForm = {
  tipo_habitacion_id: "",
  canal_id: "",
  precio: "",
  unidad: "noche",
  iva: "0",
  cargo_servicios: "0",
  moneda: "USD",
};

const MONEDAS = [
  { value: "USD", label: "USD", symbol: "$" },
  { value: "PEN", label: "PEN", symbol: "S/" },
];

const UNIDADES = [
  { value: "noche", label: "Por noche" },
  { value: "hora", label: "Por hora" },
];

export function TarifaModal({ isOpen, onClose, onSuccess, tarifa, tiposHabitacion, canales, onSave }: Props) {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tarifa) {
      setForm({
        tipo_habitacion_id: tarifa.tipo_habitacion.id,
        canal_id: tarifa.canal.id,
        precio: String(tarifa.precio),
        unidad: tarifa.unidad ?? "noche",
        iva: tarifa.iva != null ? String(tarifa.iva) : "0",
        cargo_servicios: tarifa.cargo_servicios != null ? String(tarifa.cargo_servicios) : "0",
        moneda: tarifa.moneda,
      });
    } else {
      setForm({
        ...defaultForm,
        tipo_habitacion_id: tiposHabitacion[0]?.id ?? "",
        canal_id: canales[0]?.id ?? "",
      });
    }
  }, [tarifa, isOpen, tiposHabitacion, canales]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const precio = parseFloat(form.precio);
    if (!form.tipo_habitacion_id) return sileo.error({ title: "Error", description: "Selecciona un tipo de habitación" });
    if (!form.canal_id) return sileo.error({ title: "Error", description: "Selecciona un canal" });
    if (!precio || precio <= 0) return sileo.error({ title: "Error", description: "El precio debe ser mayor a 0" });

    const payload: CreateTarifa = {
      tipo_habitacion_id: form.tipo_habitacion_id,
      canal_id: form.canal_id,
      precio,
      unidad: form.unidad.trim() || undefined,
      moneda: form.moneda,
      iva: form.iva !== "" ? parseFloat(form.iva) : 0,
      cargo_servicios: form.cargo_servicios !== "" ? parseFloat(form.cargo_servicios) : 0,
    };

    setSaving(true);
    saveInternal(payload);
  };

  const saveInternal = async (payload: CreateTarifa) => {
    try {
      await onSave(payload);
      sileo.success({ title: tarifa ? "Tarifa actualizada" : "Tarifa creada" });
      onSuccess();
      onClose();
    } catch (err) {
      if (!isHandledError(err)) { 
        sileo.error({ title: "Error", description: "No se pudo guardar la tarifa" }); 
      }
    } finally {
      setSaving(false);
    }
  };

  const selectedMoneda = MONEDAS.find(m => m.value === form.moneda);
  const selectedUnidad = UNIDADES.find(u => u.value === form.unidad);
  const selectedTipoHab = tiposHabitacion.find(t => t.id === form.tipo_habitacion_id);
  const selectedCanal = canales.find(c => c.id === form.canal_id);

  // Cálculos para preview
  const precioBase = parseFloat(form.precio) || 0;
  const ivaPercent = parseFloat(form.iva) || 0;
  const serviciosPercent = parseFloat(form.cargo_servicios) || 0;
  const ivaAmount = (precioBase * ivaPercent) / 100;
  const serviciosAmount = (precioBase * serviciosPercent) / 100;
  const precioTotal = precioBase + ivaAmount + serviciosAmount;

  const selectClass = "w-full rounded-xl py-3 text-sm px-3.5 border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow";
  const labelClass = "block font-medium text-text-primary mb-1";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={tarifa ? "Editar Tarifa" : "Nueva Tarifa"} size="xl">
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-custom">
        <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ── Layout en dos columnas ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Columna izquierda: Información básica */}
          <div className="space-y-6">
            
            {/* ── Configuración básica ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-text-muted pb-2 border-b border-border/50">
                <MdHotel className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Configuración de tarifa</span>
              </div>

              <div>
                <label className={labelClass}>Tipo de Habitación *</label>
                <select 
                  value={form.tipo_habitacion_id} 
                  onChange={(e) => setForm((f) => ({ ...f, tipo_habitacion_id: e.target.value }))} 
                  className={selectClass} 
                  required
                >
                  <option value="">Seleccionar tipo de habitación...</option>
                  {tiposHabitacion.map((t) => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Canal de Venta *</label>
                <select 
                  value={form.canal_id} 
                  onChange={(e) => setForm((f) => ({ ...f, canal_id: e.target.value }))} 
                  className={selectClass} 
                  required
                >
                  <option value="">Seleccionar canal...</option>
                  {canales.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Preview de selección */}
              {selectedTipoHab && selectedCanal && (
                <div className="bg-info-bg/30 border border-info/20 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MdBusiness className="w-4 h-4 text-info" />
                    <span className="text-xs font-medium text-info">Configuración seleccionada</span>
                  </div>
                  <div className="text-xs grid grid-cols-2 gap-x-4 gap-y-1">
                    <span className="text-text-muted">Tipo habitación</span>
                    <span className="text-text-primary font-medium">{selectedTipoHab.nombre}</span>
                    <span className="text-text-muted">Canal</span>
                    <span className="text-text-primary font-medium">{selectedCanal.nombre}</span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Columna derecha: Cargos adicionales y preview */}
          <div className="space-y-6">
            {/* ── Precio y unidad ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-text-muted pb-2 border-b border-border/50">
                <MdAttachMoney className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Precio base</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="Precio *"
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.precio}
                  onChange={(e) => setForm((f) => ({ ...f, precio: e.target.value }))}
                  placeholder="0.00"
                  required
                />
                <div>
                  <label className={labelClass}>Moneda *</label>
                  <select 
                    value={form.moneda} 
                    onChange={(e) => setForm((f) => ({ ...f, moneda: e.target.value }))} 
                    className={selectClass}
                  >
                    {MONEDAS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Unidad de Tiempo</label>
                <select 
                  value={form.unidad} 
                  onChange={(e) => setForm((f) => ({ ...f, unidad: e.target.value }))} 
                  className={selectClass}
                >
                  {UNIDADES.map((u) => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* ── Cargos adicionales ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-text-muted pb-2 border-b border-border/50">
                <MdPercent className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Cargos adicionales</span>
              </div>

              <InputField
                label="IVA (%)"
                type="number"
                min={0}
                step={0.01}
                value={form.iva}
                onChange={(e) => setForm((f) => ({ ...f, iva: e.target.value }))}
                placeholder="Ej: 18.00"
              />

              <InputField
                label="Cargo por servicios (%)"
                type="number"
                min={0}
                step={0.01}
                value={form.cargo_servicios}
                onChange={(e) => setForm((f) => ({ ...f, cargo_servicios: e.target.value }))}
                placeholder="Ej: 10.00"
              />
            </div>

            {/* ── Preview del precio ── */}
            {precioBase > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-text-muted pb-2 border-b border-border/50">
                  <MdAccountBalance className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wide">Resumen de precios</span>
                </div>

                <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-xl px-4 py-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-muted">Precio base</span>
                      <span className="text-sm font-medium text-text-primary">
                        {selectedMoneda?.symbol} {precioBase.toFixed(2)}
                      </span>
                    </div>
                    
                    {ivaPercent > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-text-muted">IVA ({ivaPercent}%)</span>
                        <span className="text-sm font-medium text-text-primary">
                          {selectedMoneda?.symbol} {ivaAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    {serviciosPercent > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-text-muted">Servicios ({serviciosPercent}%)</span>
                        <span className="text-sm font-medium text-text-primary">
                          {selectedMoneda?.symbol} {serviciosAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    <div className="border-t border-accent-primary/20 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-semibold text-accent-primary">Precio total</span>
                        <span className="text-lg font-bold text-accent-primary">
                          {selectedMoneda?.symbol} {precioTotal.toFixed(2)}
                        </span>
                      </div>
                      {selectedUnidad && (
                        <p className="text-xs text-text-muted mt-1 text-right">
                          {selectedUnidad.label.toLowerCase()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-3 pt-4 border-t border-border/50 sticky bottom-0 bg-bg-card">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1" disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={saving} className="flex-1">
            {tarifa ? "Actualizar Tarifa" : "Crear Tarifa"}
          </Button>
        </div>
      </form>
      </div>
    </Modal>
  );
}
