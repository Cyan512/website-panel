import { useState } from "react";
import { authClient } from "@/config/authClient";
import { PanelHeader, Button, EmptyState, Loading, Modal } from "@/components";
import { PagoModal } from "./PagoModal";
import { sileo } from "sileo";
import { isHandledError } from "@/utils/error.utils";
import { cn } from "@/utils/cn";
import { estadoPagoLabels, metodoPagoLabels } from "../types";
import type { Pago, EstadoPago } from "../types";
import { MdPayment, MdEdit, MdDelete, MdSearch } from "react-icons/md";
import { utils, writeFile } from "xlsx";
import { usePagos } from "../hooks/usePagos";

const estadoColors: Record<string, string> = {
  CONFIRMADO: "bg-emerald-100 text-emerald-700",
  DEVUELTO: "bg-amber-100 text-amber-700",
  RETENIDO: "bg-orange-100 text-orange-700",
  ANULADO: "bg-red-100 text-red-700",
};

export default function PagosPage() {
  const { data: session } = authClient.useSession();
  const { pagos, loading, error, fetchPagos, deletePago } = usePagos();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPago, setSelectedPago] = useState<Pago | null>(null);
  const [editingPago, setEditingPago] = useState<Pago | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<EstadoPago | "">("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  if (!session) return <Loading text="Verificando sesión..." />;
  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loading text="Cargando pagos..." /></div>;
  if (error) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-danger">{error}</div></div>;

  const handleExport = () => {
    if (pagos.length === 0) { sileo.warning({ title: "Sin datos", description: "No hay pagos para exportar" }); return; }
    const exportData = pagos.map((p) => ({
      concepto: p.concepto, estado: p.estado,
      fecha_pago: new Date(p.fecha_pago).toLocaleDateString(),
      monto: p.monto, moneda: p.moneda, metodo: p.metodo,
      receptor: p.recibido_por?.name ?? "",
      observacion: p.observacion || "",
    }));
    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Pagos");
    ws["!cols"] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 8 }, { wch: 15 }, { wch: 25 }, { wch: 35 }];
    writeFile(wb, `pagos-kori-hotel-${new Date().toISOString().split("T")[0]}.xlsx`);
    sileo.success({ title: "Exportación exitosa" });
  };

  const handleDelete = async (pago: Pago) => {
    const confirmed = window.confirm(`¿Eliminar pago de ${pago.moneda} ${parseFloat(pago.monto).toFixed(2)}?`);
    if (!confirmed) return;
    setDeleting(true);
    try {
      await deletePago(pago.id);
      if (selectedPago?.id === pago.id) setSelectedPago(null);
    } catch (err) {
      if (!isHandledError(err)) sileo.error({ title: "Error", description: "No se pudo eliminar el pago" });
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (pago: Pago) => { setEditingPago(pago); setSelectedPago(null); setIsEditModalOpen(true); };

  // Filtrado local
  const filtered = pagos.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.concepto.toLowerCase().includes(q) || p.metodo.toLowerCase().includes(q) || p.monto.includes(q);
    const matchEstado = !filterEstado || p.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const from = filtered.length === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, filtered.length);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | "...")[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
      acc.push(p); return acc;
    }, []);

  const totalMonto = pagos.reduce((acc, p) => acc + parseFloat(p.monto), 0);
  const montoConfirmado = pagos.filter(p => p.estado === "CONFIRMADO").reduce((acc, p) => acc + parseFloat(p.monto), 0);

  return (
    <>
      <PanelHeader
        title="Pagos"
        subtitle="Gestión de pagos y transacciones"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleExport}>Exportar</Button>
            <Button onClick={() => setIsModalOpen(true)}>+ Nuevo Pago</Button>
          </div>
        }
      >
        {pagos.length === 0 ? (
          <EmptyState icon={<MdPayment className="w-10 h-10 text-text-muted/50" />} title="Sin pagos" description="Registra tu primer pago" action={{ label: "Registrar Pago", onClick: () => setIsModalOpen(true) }} />
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-6">
              <div className="bg-gradient-to-br from-accent-primary/10 to-accent-light/10 rounded-2xl p-5 border border-accent-primary/20">
                <p className="text-text-muted text-sm">Total Registrado</p>
                <p className="text-2xl font-bold font-playfair mt-1">{pagos[0]?.moneda || "USD"} {totalMonto.toFixed(2)}</p>
                <p className="text-text-muted text-xs mt-1">{pagos.length} transacciones</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-40 to-emerald-100/50 rounded-2xl p-5 border border-emerald-200/50">
                <p className="text-text-muted text-sm">Confirmados</p>
                <p className="text-2xl font-bold font-playfair mt-1 text-emerald-500">{pagos[0]?.moneda || "USD"} {montoConfirmado.toFixed(2)}</p>
                <p className="text-text-muted text-xs mt-1">{pagos.filter(p => p.estado === "CONFIRMADO").length} pagos</p>
              </div>
              <div className="bg-gradient-to-br from-paper-medium/20 to-paper-medium/10 rounded-2xl p-5 border border-border-light/50">
                <p className="text-text-muted text-sm">Anulados/Devueltos</p>
                <p className="text-2xl font-bold font-playfair mt-1 text-danger">{pagos.filter(p => p.estado === "ANULADO" || p.estado === "DEVUELTO").length}</p>
                <p className="text-text-muted text-xs mt-1">transacciones</p>
              </div>
            </div>

            {/* Toolbar */}
            <div className="px-4 sm:px-6 pb-3 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por concepto, método, monto..." className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-text-muted hidden sm:block">Mostrar</span>
                <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className="text-sm rounded-xl border border-border bg-bg-card text-text-primary px-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <span className="text-xs text-text-muted hidden sm:block">filas</span>
              </div>
            </div>

            {/* Estado filters */}
            <div className="px-4 sm:px-6 pb-3 flex gap-2 flex-wrap">
              <button onClick={() => { setFilterEstado(""); setPage(1); }} className={cn("text-xs px-3 py-1.5 rounded-xl border transition-all", filterEstado === "" ? "bg-primary text-white border-primary" : "border-border text-text-muted hover:border-primary/50")}>Todos</button>
              {(Object.keys(estadoPagoLabels) as EstadoPago[]).map((k) => (
                <button key={k} onClick={() => { setFilterEstado(k); setPage(1); }} className={cn("text-xs px-3 py-1.5 rounded-xl border transition-all", filterEstado === k ? "bg-primary text-white border-primary" : "border-border text-text-muted hover:border-primary/50")}>
                  {estadoPagoLabels[k]}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto px-4 sm:px-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Fecha</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Concepto</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide hidden sm:table-cell">Método</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide hidden md:table-cell">Recibido por</th>
                    <th className="text-right py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Monto</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Estado</th>
                    <th className="py-3 px-2 text-right text-xs font-semibold text-text-muted uppercase tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-10 text-text-muted">Sin resultados</td></tr>
                  ) : paginated.map((p) => (
                    <tr key={p.id} onClick={() => setSelectedPago(p)} className="border-b border-border/50 last:border-0 hover:bg-accent-primary/5 cursor-pointer transition-colors">
                      <td className="py-3 px-2 text-text-muted text-xs">{new Date(p.fecha_pago).toLocaleDateString("es-ES")}</td>
                      <td className="py-3 px-2">
                        <p className="font-medium text-text-primary text-xs">{p.concepto}</p>
                      </td>
                      <td className="py-3 px-2 text-text-muted hidden sm:table-cell text-xs">{metodoPagoLabels[p.metodo] ?? p.metodo}</td>
                      <td className="py-3 px-2 text-text-muted hidden md:table-cell text-xs">{p.recibido_por?.name ?? "—"}</td>
                      <td className="py-3 px-2 text-right font-semibold text-text-primary">{p.moneda} {parseFloat(p.monto).toFixed(2)}</td>
                      <td className="py-3 px-2">
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", estadoColors[p.estado] ?? "bg-gray-100 text-gray-600")}>
                          {estadoPagoLabels[p.estado]}
                        </span>
                      </td>
                      <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleEdit(p)} title="Editar" className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all"><MdEdit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(p)} disabled={deleting} title="Eliminar" className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all disabled:opacity-40"><MdDelete className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-xs text-text-muted px-4 sm:px-6 py-4 border-t border-border/50">
              <span>{filtered.length === 0 ? "Sin resultados" : `${from}–${to} de ${filtered.length} pago${filtered.length !== 1 ? "s" : ""}`}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(1)} disabled={page === 1} className={cn("px-2 py-1.5 rounded-lg border transition-all", page === 1 ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}>«</button>
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className={cn("px-3 py-1.5 rounded-lg border transition-all", page === 1 ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}>Anterior</button>
                {pageNumbers.map((p, i) =>
                  p === "..." ? <span key={`e-${i}`} className="px-1">…</span> : (
                    <button key={p} onClick={() => setPage(p as number)} className={cn("w-8 h-8 rounded-lg border text-xs transition-all", p === page ? "bg-primary text-white border-primary" : "border-border hover:border-primary/50 hover:text-primary")}>{p}</button>
                  )
                )}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className={cn("px-3 py-1.5 rounded-lg border transition-all", page === totalPages ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}>Siguiente</button>
                <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className={cn("px-2 py-1.5 rounded-lg border transition-all", page === totalPages ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}>»</button>
              </div>
            </div>
          </>
        )}
      </PanelHeader>

      <PagoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchPagos} />
      <PagoModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingPago(null); }} onSuccess={fetchPagos} pago={editingPago} />

      {selectedPago && (
        <Modal isOpen={!!selectedPago} onClose={() => setSelectedPago(null)} title="Detalle del Pago">
          <div className="space-y-4">
            <div className="text-center py-4 bg-paper-medium/20 rounded-2xl">
              <p className="text-4xl font-bold font-playfair text-accent-primary">{selectedPago.moneda} {parseFloat(selectedPago.monto).toFixed(2)}</p>
              <p className="text-text-muted mt-2 text-sm">{selectedPago.concepto === "RESERVA" ? "Pago de Reserva" : "Pago de Consumo"}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-paper-medium/20 rounded-xl p-3"><p className="text-text-muted text-xs">Método</p><p className="text-sm font-medium">{metodoPagoLabels[selectedPago.metodo] ?? selectedPago.metodo}</p></div>
              <div className="bg-paper-medium/20 rounded-xl p-3">
                <p className="text-text-muted text-xs">Estado</p>
                <span className={cn("inline-block px-2 py-1 text-xs font-semibold rounded-full mt-1", estadoColors[selectedPago.estado] ?? "bg-gray-100 text-gray-600")}>{estadoPagoLabels[selectedPago.estado]}</span>
              </div>
            </div>
            <div className="bg-paper-medium/10 rounded-xl p-3">
              <p className="text-text-muted text-xs">Fecha de Pago</p>
              <p className="text-sm font-medium">{new Date(selectedPago.fecha_pago).toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            {selectedPago.recibido_por && (
              <div className="bg-paper-medium/10 rounded-xl p-3">
                <p className="text-text-muted text-xs">Recibido por</p>
                <p className="text-sm font-medium">{selectedPago.recibido_por.name}</p>
              </div>
            )}
            {selectedPago.observacion && (
              <div className="bg-paper-medium/10 rounded-xl p-3">
                <p className="text-text-muted text-xs">Observación</p>
                <p className="text-sm">{selectedPago.observacion}</p>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button onClick={() => handleEdit(selectedPago)} className="flex-1 py-3 bg-accent-primary/10 text-accent-primary font-medium rounded-xl hover:bg-accent-primary/20 transition-all border border-accent-primary/20">Editar</button>
              <button onClick={() => handleDelete(selectedPago)} disabled={deleting} className="flex-1 py-3 bg-red-50 text-danger font-medium rounded-xl hover:bg-red-100 transition-all border border-red-200 disabled:opacity-50">{deleting ? "Eliminando..." : "Eliminar"}</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
