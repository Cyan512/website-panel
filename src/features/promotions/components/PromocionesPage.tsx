import { useState } from "react";
import { PanelHeader, Button, Modal, InputField } from "@/components";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import { cn } from "@/shared/utils/cn";
import { MdEdit, MdDelete, MdSearch, MdAdd, MdClose } from "react-icons/md";
import { usePromociones } from "../hooks/usePromociones";
import { useHabitaciones } from "@/features/rooms/hooks/useRooms";
import { authClient } from "@/shared/lib/auth";
import type { Promocion, CreatePromocion, UpdatePromocion } from "../types";
import { formatUTCDate } from "@/shared/utils/format";

// ─── helpers ────────────────────────────────────────────────────────────────

const selectClass = "w-full rounded-xl py-3 text-sm px-3.5 border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30";
const labelClass = "block text-sm font-medium text-text-primary mb-1";

function toDateInput(d?: string | Date | null): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

function isVigente(p: Promocion): boolean {
  const now = new Date();
  return p.estado && new Date(p.vig_desde) <= now && new Date(p.vig_hasta) >= now;
}

// ─── Form state ──────────────────────────────────────────────────────────────

interface PromoFormState {
  codigo: string;
  tipo_descuento: "PORCENTAJE" | "MONTO_FIJO";
  valor_descuento: string;
  vig_desde: string;
  vig_hasta: string;
  estado: boolean;
  habitaciones: string[]; // array of IDs
}

const emptyForm: PromoFormState = {
  codigo: "",
  tipo_descuento: "PORCENTAJE",
  valor_descuento: "",
  vig_desde: "",
  vig_hasta: "",
  estado: true,
  habitaciones: [],
};

function promoToForm(p: Promocion): PromoFormState {
  return {
    codigo: p.codigo,
    tipo_descuento: p.tipo_descuento,
    valor_descuento: String(p.valor_descuento),
    vig_desde: toDateInput(p.vig_desde),
    vig_hasta: toDateInput(p.vig_hasta),
    estado: p.estado,
    habitaciones: p.habitaciones,
  };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PromocionesPage() {
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const {
    filtered, paginated, loading, error,
    search, setSearch, page, setPage, limit, setLimit, totalPages,
    createPromocion, updatePromocion, deletePromocion,
  } = usePromociones();

  // Load all rooms for the picker (high limit to get all)
  const { habitaciones } = useHabitaciones(1, 100);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promocion | null>(null);
  const [form, setForm] = useState<PromoFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-text-muted text-sm">Cargando promociones...</div>;
  if (error) return <div className="flex items-center justify-center min-h-[60vh] text-danger text-sm">{error}</div>;

  const openCreate = () => { setEditingPromo(null); setForm(emptyForm); setIsModalOpen(true); };
  const openEdit = (p: Promocion) => { setEditingPromo(p); setForm(promoToForm(p)); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditingPromo(null); };

  // Toggle a room ID in/out of the selection
  const toggleHabitacion = (id: string) => {
    setForm((f) => ({
      ...f,
      habitaciones: f.habitaciones.includes(id)
        ? f.habitaciones.filter((h) => h !== id)
        : [...f.habitaciones, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.codigo.trim() || !form.valor_descuento || !form.vig_desde || !form.vig_hasta) {
      sileo.warning({ title: "Campos requeridos", description: "Código, valor, vigencia desde y hasta son obligatorios" });
      return;
    }
    const valor = parseFloat(form.valor_descuento);
    if (isNaN(valor) || valor <= 0) {
      sileo.warning({ title: "Valor inválido", description: "El valor del descuento debe ser mayor a 0" });
      return;
    }
    setSaving(true);
    try {
      if (editingPromo) {
        const payload: UpdatePromocion = {
          codigo: form.codigo.trim(),
          tipo_descuento: form.tipo_descuento,
          valor_descuento: valor,
          vig_desde: new Date(form.vig_desde),
          vig_hasta: new Date(form.vig_hasta),
          estado: form.estado,
          habitaciones: form.habitaciones,
        };
        await updatePromocion(editingPromo.id, payload);
      } else {
        const payload: CreatePromocion = {
          codigo: form.codigo.trim(),
          tipo_descuento: form.tipo_descuento,
          valor_descuento: valor,
          vig_desde: new Date(form.vig_desde),
          vig_hasta: new Date(form.vig_hasta),
          estado: form.estado,
          habitaciones: form.habitaciones,
        };
        await createPromocion(payload);
      }
      closeModal();
    } catch (err) {
      if (!isHandledError(err)) sileo.error({ title: "Error", description: "No se pudo guardar la promoción" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: Promocion) => {
    if (!window.confirm(`¿Eliminar la promoción "${p.codigo}"?`)) return;
    setDeleting(true);
    try {
      await deletePromocion(p.id);
    } catch (err) {
      if (!isHandledError(err)) sileo.error({ title: "Error", description: "No se pudo eliminar la promoción" });
    } finally {
      setDeleting(false);
    }
  };

  const from = filtered.length === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, filtered.length);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | "...")[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
      acc.push(p); return acc;
    }, []);

  return (
    <>
      <PanelHeader
        title="Promociones"
        subtitle="Gestión de descuentos y promociones"
        action={isAdmin ? <Button onClick={openCreate}><MdAdd className="w-4 h-4 mr-1" />Nueva Promoción</Button> : undefined}
      >
        {/* Toolbar */}
        <div className="px-4 sm:px-6 py-3 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar por código..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-text-muted hidden sm:block">Mostrar</span>
            <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="text-sm rounded-xl border border-border bg-bg-card text-text-primary px-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30">
              {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <span className="text-xs text-text-muted hidden sm:block">filas</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto px-4 sm:px-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Código</th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide hidden sm:table-cell">Tipo</th>
                <th className="text-right py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Valor</th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide hidden md:table-cell">Vigencia</th>
                <th className="text-center py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide hidden sm:table-cell">Estado</th>
                <th className="text-center py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide hidden lg:table-cell">Habitaciones</th>
                <th className="py-3 px-2 text-right text-xs font-semibold text-text-muted uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-text-muted">Sin resultados</td></tr>
              ) : paginated.map((p) => {
                const vigente = isVigente(p);
                return (
                  <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-accent-primary/5 transition-colors">
                    <td className="py-3 px-2 font-mono text-xs font-semibold text-text-primary">{p.codigo}</td>
                    <td className="py-3 px-2 text-xs text-text-muted hidden sm:table-cell">
                      {p.tipo_descuento === "PORCENTAJE" ? "Porcentaje" : "Monto fijo"}
                    </td>
                    <td className="py-3 px-2 text-right font-semibold text-text-primary">
                      {p.tipo_descuento === "PORCENTAJE"
                        ? `${p.valor_descuento}%`
                        : `S/ ${p.valor_descuento.toFixed(2)}`}
                    </td>
                    <td className="py-3 px-2 text-xs text-text-muted hidden md:table-cell">
                      {formatUTCDate(p.vig_desde)}
                      {" → "}
                      {formatUTCDate(p.vig_hasta)}
                    </td>
                    <td className="py-3 px-2 text-center hidden sm:table-cell">
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
                        vigente ? "bg-success-bg text-success" :
                        p.estado ? "bg-warning-bg text-warning" :
                        "bg-bg-tertiary text-text-muted"
                      )}>
                        {vigente ? "Vigente" : p.estado ? "Inactiva" : "Desactivada"}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-xs text-text-muted hidden lg:table-cell">
                      {p.habitaciones.length > 0 ? p.habitaciones.length : "—"}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center justify-end gap-1">
                        {isAdmin && (
                          <>
                            <button onClick={() => openEdit(p)} title="Editar"
                              className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all">
                              <MdEdit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(p)} disabled={deleting} title="Eliminar"
                              className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all disabled:opacity-40">
                              <MdDelete className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between text-xs text-text-muted px-4 sm:px-6 py-4 border-t border-border/50">
          <span>{filtered.length === 0 ? "Sin resultados" : `${from}–${to} de ${filtered.length} promoción${filtered.length !== 1 ? "es" : ""}`}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(1)} disabled={page === 1} className={cn("px-2 py-1.5 rounded-lg border transition-all", page === 1 ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}>«</button>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className={cn("px-3 py-1.5 rounded-lg border transition-all", page === 1 ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}>Anterior</button>
            {pageNumbers.map((p, i) => p === "..." ? <span key={`e-${i}`} className="px-1">…</span> : (
              <button key={p} onClick={() => setPage(p as number)} className={cn("w-8 h-8 rounded-lg border text-xs transition-all", p === page ? "bg-primary text-white border-primary" : "border-border hover:border-primary/50 hover:text-primary")}>{p}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className={cn("px-3 py-1.5 rounded-lg border transition-all", page === totalPages ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}>Siguiente</button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className={cn("px-2 py-1.5 rounded-lg border transition-all", page === totalPages ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}>»</button>
          </div>
        </div>
      </PanelHeader>

      {/* ── Modal ── */}
      {isAdmin && (
        <Modal isOpen={isModalOpen} onClose={closeModal} title={editingPromo ? "Editar Promoción" : "Nueva Promoción"} size="lg">
        <div className="max-h-[70vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Código *"
              value={form.codigo}
              onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
              placeholder="PROMO-001"
              required
            />
            <div>
              <label className={labelClass}>Tipo de descuento</label>
              <select value={form.tipo_descuento} onChange={(e) => setForm((f) => ({ ...f, tipo_descuento: e.target.value as "PORCENTAJE" | "MONTO_FIJO" }))} className={selectClass}>
                <option value="PORCENTAJE">Porcentaje (%)</option>
                <option value="MONTO_FIJO">Monto fijo (S/)</option>
              </select>
            </div>
          </div>

          <InputField
            label={`Valor del descuento ${form.tipo_descuento === "PORCENTAJE" ? "(%)" : "(S/)"} *`}
            type="number"
            min="0.01"
            step="0.01"
            value={form.valor_descuento}
            onChange={(e) => setForm((f) => ({ ...f, valor_descuento: e.target.value }))}
            placeholder={form.tipo_descuento === "PORCENTAJE" ? "10" : "50.00"}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Vigente desde *"
              type="date"
              value={form.vig_desde}
              onChange={(e) => setForm((f) => ({ ...f, vig_desde: e.target.value }))}
              required
            />
            <InputField
              label="Vigente hasta *"
              type="date"
              value={form.vig_hasta}
              onChange={(e) => setForm((f) => ({ ...f, vig_hasta: e.target.value }))}
              required
            />
          </div>

          {/* ── Habitaciones picker ── */}
          <div>
            <label className={labelClass}>
              Habitaciones
              <span className="text-text-muted font-normal ml-1">(opcional — vacío aplica a todas)</span>
            </label>

            {/* Selected chips */}
            {form.habitaciones.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.habitaciones.map((id) => {
                  const hab = habitaciones.find((h) => h.id === id);
                  return (
                    <span key={id} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                      Hab. {hab?.nro_habitacion ?? id.slice(0, 6)}
                      <button
                        type="button"
                        onClick={() => toggleHabitacion(id)}
                        className="hover:text-danger transition-colors"
                      >
                        <MdClose className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Room grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-40 overflow-y-auto p-1 rounded-xl border border-border bg-bg-card">
              {habitaciones.length === 0 ? (
                <p className="col-span-4 text-xs text-text-muted text-center py-4">Cargando habitaciones...</p>
              ) : habitaciones.map((h) => {
                const selected = form.habitaciones.includes(h.id);
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => toggleHabitacion(h.id)}
                    className={cn(
                      "rounded-lg px-2 py-2 text-xs font-medium transition-all text-center",
                      selected
                        ? "bg-primary text-white"
                        : "bg-bg-card border border-border text-text-muted hover:border-primary/50 hover:text-primary"
                    )}
                  >
                    <span className="block font-semibold">Nro. {h.nro_habitacion}</span>
                    <span className="block text-[10px] opacity-70">Piso {h.piso}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-text-muted mt-1">
              {form.habitaciones.length === 0
                ? "Ninguna seleccionada — aplica a todas"
                : `${form.habitaciones.length} habitación${form.habitaciones.length !== 1 ? "es" : ""} seleccionada${form.habitaciones.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="promo-estado"
              checked={form.estado}
              onChange={(e) => setForm((f) => ({ ...f, estado: e.target.checked }))}
              className="w-4 h-4 accent-primary"
            />
            <label htmlFor="promo-estado" className="text-sm text-text-primary">Activa</label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeModal} className="flex-1">Cancelar</Button>
            <Button type="submit" isLoading={saving} className="flex-1">{saving ? "Guardando..." : editingPromo ? "Actualizar" : "Crear"}</Button>
          </div>
        </form>
        </div>
      </Modal>
      )}
    </>
  );
}
