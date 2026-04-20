import { useState } from "react";
import { PanelHeader, Button, Modal, InputField } from "@/components";
import { sileo } from "sileo";
import { isHandledError } from "@/utils/error.utils";
import { cn } from "@/utils/cn";
import { MdEdit, MdDelete, MdSearch, MdAdd, MdSwapVert } from "react-icons/md";
import { useInsumosCocina } from "../hooks/useInsumosCocina";
import { authClient } from "@/config/authClient";
import { UnidadInsumo, TipoMovimiento, MotivoEntrada, MotivoSalida } from "../types";
import type { InsumoCocina, CreateInsumoCocina, UpdateInsumoCocina, CreateMovimientoCocina } from "../types";

// ─── helpers ────────────────────────────────────────────────────────────────

const UNIDADES = Object.values(UnidadInsumo);
const selectClass = "w-full rounded-xl py-3 text-sm px-3.5 border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30";
const labelClass = "block text-sm font-medium text-text-primary mb-1";

function stockBadge(actual: number, minimo: number) {
  if (actual <= 0) return "bg-red-100 text-red-700";
  if (actual <= minimo) return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

// ─── Insumo form ─────────────────────────────────────────────────────────────

interface InsumoFormState {
  codigo: string; nombre: string; unidad: UnidadInsumo;
  stock_actual: string; stock_minimo: string; notas: string; activo: boolean;
}

const emptyInsumoForm: InsumoFormState = {
  codigo: "", nombre: "", unidad: UnidadInsumo.Unidad,
  stock_actual: "0", stock_minimo: "0", notas: "", activo: true,
};

function insumoToForm(i: InsumoCocina): InsumoFormState {
  return {
    codigo: i.codigo, nombre: i.nombre, unidad: i.unidad,
    stock_actual: String(i.stock_actual), stock_minimo: String(i.stock_minimo),
    notas: i.notas ?? "", activo: i.activo,
  };
}

// ─── Movimiento form ─────────────────────────────────────────────────────────

interface MovForm {
  tipo: TipoMovimiento; cantidad: string;
  motivo_entrada: MotivoEntrada | ""; motivo_salida: MotivoSalida | ""; notas: string;
}

const emptyMovForm: MovForm = {
  tipo: TipoMovimiento.Entrada, cantidad: "",
  motivo_entrada: MotivoEntrada.Compra, motivo_salida: "",
  notas: "",
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function InsumosCocinaPage() {
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const {
    filtered, paginated, loading, error,
    search, setSearch, page, setPage, limit, setLimit, totalPages,
    createInsumo, updateInsumo, deleteInsumo, registrarMovimiento,
  } = useInsumosCocina();

  const [insumoModal, setInsumoModal] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState<InsumoCocina | null>(null);
  const [insumoForm, setInsumoForm] = useState<InsumoFormState>(emptyInsumoForm);
  const [savingInsumo, setSavingInsumo] = useState(false);

  const [movModal, setMovModal] = useState(false);
  const [movTarget, setMovTarget] = useState<InsumoCocina | null>(null);
  const [movForm, setMovForm] = useState<MovForm>(emptyMovForm);
  const [savingMov, setSavingMov] = useState(false);

  const [deleting, setDeleting] = useState(false);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-text-muted text-sm">Cargando insumos de cocina...</div>;
  if (error) return <div className="flex items-center justify-center min-h-[60vh] text-danger text-sm">{error}</div>;

  // ── Insumo CRUD ──
  const openCreate = () => { setEditingInsumo(null); setInsumoForm(emptyInsumoForm); setInsumoModal(true); };
  const openEdit = (i: InsumoCocina) => { setEditingInsumo(i); setInsumoForm(insumoToForm(i)); setInsumoModal(true); };
  const closeInsumoModal = () => { setInsumoModal(false); setEditingInsumo(null); };

  const handleInsumoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!insumoForm.codigo.trim() || !insumoForm.nombre.trim()) {
      sileo.warning({ title: "Campos requeridos", description: "Código y nombre son obligatorios" });
      return;
    }
    setSavingInsumo(true);
    try {
      if (editingInsumo) {
        const payload: UpdateInsumoCocina = {
          codigo: insumoForm.codigo.trim(),
          nombre: insumoForm.nombre.trim(),
          unidad: insumoForm.unidad,
          stock_actual: Number(insumoForm.stock_actual),
          stock_minimo: Number(insumoForm.stock_minimo),
          notas: insumoForm.notas.trim() || undefined,
          activo: insumoForm.activo,
        };
        await updateInsumo(editingInsumo.id, payload);
      } else {
        const payload: CreateInsumoCocina = {
          codigo: insumoForm.codigo.trim(),
          nombre: insumoForm.nombre.trim(),
          unidad: insumoForm.unidad,
          stock_actual: Number(insumoForm.stock_actual),
          stock_minimo: Number(insumoForm.stock_minimo),
          notas: insumoForm.notas.trim() || undefined,
        };
        await createInsumo(payload);
      }
      closeInsumoModal();
    } catch (err) {
      if (!isHandledError(err)) sileo.error({ title: "Error", description: "No se pudo guardar el insumo" });
    } finally {
      setSavingInsumo(false);
    }
  };

  const handleDelete = async (i: InsumoCocina) => {
    if (!window.confirm(`¿Eliminar "${i.nombre}"?`)) return;
    setDeleting(true);
    try {
      await deleteInsumo(i.id);
    } catch (err) {
      if (!isHandledError(err)) sileo.error({ title: "Error", description: "No se pudo eliminar el insumo" });
    } finally {
      setDeleting(false);
    }
  };

  // ── Movimiento ──
  const openMov = (i: InsumoCocina) => { setMovTarget(i); setMovForm(emptyMovForm); setMovModal(true); };
  const closeMovModal = () => { setMovModal(false); setMovTarget(null); };

  const handleMovSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movTarget || !movForm.cantidad || Number(movForm.cantidad) <= 0) {
      sileo.warning({ title: "Cantidad inválida", description: "Ingresa una cantidad mayor a 0" });
      return;
    }
    setSavingMov(true);
    try {
      const payload: CreateMovimientoCocina = {
        insumo_id: movTarget.id,
        tipo: movForm.tipo,
        cantidad: Number(movForm.cantidad),
        ...(movForm.tipo === TipoMovimiento.Entrada && movForm.motivo_entrada
          ? { motivo_entrada: movForm.motivo_entrada as MotivoEntrada }
          : {}),
        ...(movForm.tipo === TipoMovimiento.Salida && movForm.motivo_salida
          ? { motivo_salida: movForm.motivo_salida as MotivoSalida }
          : {}),
        notas: movForm.notas.trim() || undefined,
      };
      await registrarMovimiento(payload);
      closeMovModal();
    } catch (err) {
      if (!isHandledError(err)) sileo.error({ title: "Error", description: "No se pudo registrar el movimiento" });
    } finally {
      setSavingMov(false);
    }
  };

  // ── Pagination ──
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
        title="Insumos de Cocina"
        subtitle="Control de stock e inventario de cocina"
        action={isAdmin ? <Button onClick={openCreate}><MdAdd className="w-4 h-4 mr-1" />Nuevo Insumo</Button> : undefined}
      >
        {/* Toolbar */}
        <div className="px-4 sm:px-6 py-3 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar por nombre o código..."
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
                <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Nombre</th>
                <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide hidden sm:table-cell">Unidad</th>
                <th className="text-right py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Stock</th>
                <th className="text-right py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide hidden md:table-cell">Mínimo</th>
                <th className="text-center py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide hidden sm:table-cell">Estado</th>
                <th className="py-3 px-2 text-right text-xs font-semibold text-text-muted uppercase tracking-wide">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-text-muted">Sin resultados</td></tr>
              ) : paginated.map((i) => (
                <tr key={i.id} className="border-b border-border/50 last:border-0 hover:bg-accent-primary/5 transition-colors">
                  <td className="py-3 px-2 text-xs font-mono text-text-muted">{i.codigo}</td>
                  <td className="py-3 px-2 font-medium text-text-primary">{i.nombre}</td>
                  <td className="py-3 px-2 text-text-muted text-xs hidden sm:table-cell">{i.unidad}</td>
                  <td className="py-3 px-2 text-right">
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", stockBadge(i.stock_actual, i.stock_minimo))}>
                      {i.stock_actual}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right text-text-muted text-xs hidden md:table-cell">{i.stock_minimo}</td>
                  <td className="py-3 px-2 text-center hidden sm:table-cell">
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", i.activo ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500")}>
                      {i.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center justify-end gap-1">
                      {isAdmin && (
                        <>
                          <button onClick={() => openMov(i)} title="Registrar movimiento"
                            className="p-1.5 rounded-lg text-text-muted hover:text-accent-primary hover:bg-accent-primary/10 transition-all">
                            <MdSwapVert className="w-4 h-4" />
                          </button>
                          <button onClick={() => openEdit(i)} title="Editar"
                            className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all">
                            <MdEdit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(i)} disabled={deleting} title="Eliminar"
                            className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all disabled:opacity-40">
                            <MdDelete className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between text-xs text-text-muted px-4 sm:px-6 py-4 border-t border-border/50">
          <span>{filtered.length === 0 ? "Sin resultados" : `${from}–${to} de ${filtered.length} insumo${filtered.length !== 1 ? "s" : ""}`}</span>
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

      {/* ── Insumo Modal ── */}
      {isAdmin && (
        <Modal isOpen={insumoModal} onClose={closeInsumoModal} title={editingInsumo ? "Editar Insumo" : "Nuevo Insumo de Cocina"}>
          <form onSubmit={handleInsumoSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Código *" value={insumoForm.codigo} onChange={(e) => setInsumoForm((f) => ({ ...f, codigo: e.target.value }))} placeholder="COC-001" required />
              <InputField label="Nombre *" value={insumoForm.nombre} onChange={(e) => setInsumoForm((f) => ({ ...f, nombre: e.target.value }))} placeholder="Nombre del insumo" required />
            </div>
            <div>
              <label className={labelClass}>Unidad</label>
              <select value={insumoForm.unidad} onChange={(e) => setInsumoForm((f) => ({ ...f, unidad: e.target.value as UnidadInsumo }))} className={selectClass}>
                {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Stock actual" type="number" min="0" value={insumoForm.stock_actual} onChange={(e) => setInsumoForm((f) => ({ ...f, stock_actual: e.target.value }))} placeholder="0" />
              <InputField label="Stock mínimo" type="number" min="0" value={insumoForm.stock_minimo} onChange={(e) => setInsumoForm((f) => ({ ...f, stock_minimo: e.target.value }))} placeholder="0" />
            </div>
            <div>
              <label className={labelClass}>Notas (opcional)</label>
              <textarea value={insumoForm.notas} onChange={(e) => setInsumoForm((f) => ({ ...f, notas: e.target.value }))} rows={2}
                className="w-full rounded-xl py-3 text-sm px-3.5 border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                placeholder="Observaciones..." />
            </div>
            {editingInsumo && (
              <div className="flex items-center gap-3">
                <input type="checkbox" id="activo-cocina" checked={insumoForm.activo} onChange={(e) => setInsumoForm((f) => ({ ...f, activo: e.target.checked }))} className="w-4 h-4 accent-primary" />
                <label htmlFor="activo-cocina" className="text-sm text-text-primary">Activo</label>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={closeInsumoModal} className="flex-1">Cancelar</Button>
              <Button type="submit" isLoading={savingInsumo} className="flex-1">{savingInsumo ? "Guardando..." : editingInsumo ? "Actualizar" : "Crear"}</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Movimiento Modal ── */}
      {isAdmin && (
        <Modal isOpen={movModal} onClose={closeMovModal} title={`Movimiento · ${movTarget?.nombre ?? ""}`}>
          <form onSubmit={handleMovSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Tipo</label>
                <select value={movForm.tipo} onChange={(e) => setMovForm((f) => ({ ...f, tipo: e.target.value as TipoMovimiento, motivo_entrada: MotivoEntrada.Compra, motivo_salida: "" }))} className={selectClass}>
                  <option value={TipoMovimiento.Entrada}>Entrada</option>
                  <option value={TipoMovimiento.Salida}>Salida</option>
                </select>
              </div>
              <InputField label="Cantidad *" type="number" min="0.01" step="0.01" value={movForm.cantidad} onChange={(e) => setMovForm((f) => ({ ...f, cantidad: e.target.value }))} placeholder="0" required />
            </div>

            {movForm.tipo === TipoMovimiento.Entrada ? (
              <div>
                <label className={labelClass}>Motivo de entrada</label>
                <select value={movForm.motivo_entrada} onChange={(e) => setMovForm((f) => ({ ...f, motivo_entrada: e.target.value as MotivoEntrada }))} className={selectClass}>
                  {Object.values(MotivoEntrada).map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            ) : (
              <div>
                <label className={labelClass}>Motivo de salida</label>
                <select value={movForm.motivo_salida} onChange={(e) => setMovForm((f) => ({ ...f, motivo_salida: e.target.value as MotivoSalida }))} className={selectClass}>
                  <option value="">Sin motivo</option>
                  {Object.values(MotivoSalida).map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className={labelClass}>Notas (opcional)</label>
              <textarea value={movForm.notas} onChange={(e) => setMovForm((f) => ({ ...f, notas: e.target.value }))} rows={2}
                className="w-full rounded-xl py-3 text-sm px-3.5 border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                placeholder="Observaciones..." />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={closeMovModal} className="flex-1">Cancelar</Button>
              <Button type="submit" isLoading={savingMov} className="flex-1">{savingMov ? "Registrando..." : "Registrar"}</Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
