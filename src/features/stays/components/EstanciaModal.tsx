import { useState, useEffect, useRef } from "react";
import { Modal, Button, InputField } from "@/components";
import { sileo } from "sileo";
import { estadoEstadiaLabels } from "../types";
import type { Estancia, CreateEstancia, EstadoEstadia } from "../types";
import type { Reserva } from "@/features/reservations/types";
import { cn } from "@/shared/utils/cn";
import { isHandledError } from "@/shared/utils/error";
import { formatUTCDate } from "@/shared/utils/format";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  estancia?: Estancia | null;
  onSave: (data: CreateEstancia) => Promise<Estancia>;
}

const toDateInput = (d?: string | Date | null) => {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 16);
};

const selectClass = "field-input w-full rounded-xl py-3.5 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50";
const labelClass = "field-label block mb-2 text-text-secondary font-medium";

export function EstanciaModal({ isOpen, onClose, onSuccess, estancia, onSave }: Props) {
  const [reservaQuery, setReservaQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Reserva[]>([]);
  const [reservaSeleccionada, setReservaSeleccionada] = useState<Reserva | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [form, setForm] = useState({
    fechaEntrada: toDateInput(new Date()),
    fechaSalida: "",
    estado: "EN_CASA" as EstadoEstadia,
    notas: "",
  });
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchReservas = async (q: string) => {
    if (!q.trim()) { setSuggestions([]); return; }
    setSearching(true);
    try {
      const { reservasApi } = await import("@/features/reservations/api");
      const data = await reservasApi.getAll(1, 10, q);
      setSuggestions(data.list);
    } catch {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  };

  const handleQueryChange = (q: string) => {
    setReservaQuery(q);
    setReservaSeleccionada(null);
    setShowSuggestions(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchReservas(q), 300);
  };

  useEffect(() => {
    if (!isOpen) return;
    if (estancia) {
      setReservaSeleccionada(null);
      setReservaQuery(estancia.reserva_id);
      setForm({
        fechaEntrada: toDateInput(estancia.fecha_entrada),
        fechaSalida: toDateInput(estancia.fecha_salida),
        estado: estancia.estado,
        notas: estancia.notas ?? "",
      });
    } else {
      setReservaSeleccionada(null);
      setReservaQuery("");
      setSuggestions([]);
      setForm({ fechaEntrada: toDateInput(new Date()), fechaSalida: "", estado: "EN_CASA", notas: "" });
    }
  }, [isOpen, estancia]);

  const handleSelectReserva = (r: Reserva) => {
    setReservaSeleccionada(r);
    setReservaQuery(`${r.codigo} — ${r.nombre_huesped}`);
    setShowSuggestions(false);
    setSuggestions([]);
    setForm((f) => ({
      ...f,
      fechaEntrada: toDateInput(r.fecha_inicio),
      fechaSalida: toDateInput(r.fecha_fin),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservaSeleccionada) return sileo.error({ title: "Error", description: "Selecciona una reserva válida" });

    const payload: CreateEstancia = {
      reservaId: reservaSeleccionada.id,
      habitacionId: reservaSeleccionada.habitacionId,
      huespedId: reservaSeleccionada.huespedId,
      estado: form.estado,
      ...(form.fechaEntrada && { fechaEntrada: new Date(form.fechaEntrada) }),
      ...(form.fechaSalida ? { fechaSalida: new Date(form.fechaSalida) } : { fechaSalida: null }),
      ...(form.notas.trim() ? { notas: form.notas.trim() } : { notas: null }),
    };

    setSaving(true);
    try {
      await onSave(payload);
      sileo.success({ title: estancia ? "Estancia actualizada" : "Estancia creada" });
      onSuccess();
      onClose();
    } catch (err) {
      if (!isHandledError(err)) {
        sileo.error({ title: "Error", description: "No se pudo guardar la estancia" });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={estancia ? "Editar Estancia" : "Nueva Estancia"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Buscador de reserva */}
        <div className="relative">
          <label className={labelClass}>Reserva</label>
          <input
            ref={inputRef}
            type="text"
            value={reservaQuery}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Buscar por código o nombre de huésped..."
            className={cn(selectClass, reservaSeleccionada ? "border-emerald-500/50 bg-success/5" : "")}
            required
          />

          {showSuggestions && (searching || suggestions.length > 0) && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-bg-card border border-border rounded-xl shadow-xl overflow-hidden">
              {searching ? (
                <div className="px-4 py-3 text-sm text-text-muted">Buscando...</div>
              ) : suggestions.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onMouseDown={() => handleSelectReserva(r)}
                  className="w-full flex items-start gap-3 px-4 py-3 hover:bg-bg-hover transition-colors text-left border-b border-border/50 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-primary">{r.codigo}</span>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                        r.estado === "CONFIRMADA" ? "bg-success-bg text-success" :
                        r.estado === "TENTATIVA" ? "bg-warning-bg text-warning" :
                        "bg-bg-tertiary text-text-muted"
                      )}>{r.estado}</span>
                    </div>
                    <p className="text-sm text-text-primary mt-0.5">{r.nombre_huesped}</p>
                    <p className="text-xs text-text-muted">
                      Hab. {r.nro_habitacion} · {formatUTCDate(r.fecha_inicio)} → {formatUTCDate(r.fecha_fin)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Preview de datos autocompletados */}
        {reservaSeleccionada && (
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm space-y-1.5">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Datos autocompletados</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <span className="text-text-muted">Huésped</span>
              <span className="text-text-primary font-medium">{reservaSeleccionada.nombre_huesped}</span>
              <span className="text-text-muted">Habitación</span>
              <span className="text-text-primary font-medium">Nro. {reservaSeleccionada.nro_habitacion}</span>
              <span className="text-text-muted">Tipo</span>
              <span className="text-text-primary font-medium">{reservaSeleccionada.nombre_tipo_hab}</span>
              <span className="text-text-muted">Canal</span>
              <span className="text-text-primary font-medium">{reservaSeleccionada.nombre_canal}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Fecha de entrada"
            type="datetime-local"
            value={form.fechaEntrada}
            onChange={(e) => setForm((f) => ({ ...f, fechaEntrada: e.target.value }))}
          />
          <InputField
            label="Fecha de salida (opcional)"
            type="datetime-local"
            value={form.fechaSalida}
            onChange={(e) => setForm((f) => ({ ...f, fechaSalida: e.target.value }))}
          />
        </div>

        <div>
          <label className={labelClass}>Estado</label>
          <select value={form.estado} onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value as EstadoEstadia }))} className={selectClass}>
            {Object.entries(estadoEstadiaLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Notas (opcional)</label>
          <textarea
            value={form.notas}
            onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))}
            rows={2}
            className="field-input w-full rounded-xl py-3 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50 resize-none"
            placeholder="Observaciones..."
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button type="submit" isLoading={saving} className="flex-1">{saving ? "Guardando..." : estancia ? "Actualizar" : "Crear"}</Button>
        </div>
      </form>
    </Modal>
  );
}
