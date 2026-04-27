import { useState } from "react";
import { authClient } from "@/shared/lib/auth";
import { PanelHeader, Button, EmptyState, Loading, Modal, ConfirmDialog } from "@/components";
import { PagoModal } from "./PagoModal";
import { PagosTable } from "./PagosTable";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import { cn } from "@/shared/utils/cn";
import { estadoPagoLabels, metodoPagoLabels } from "../types";
import type { Pago, EstadoPago } from "../types";
import { MdPayment } from "react-icons/md";
import { utils, writeFile } from "xlsx";
import { usePagos } from "../hooks/usePagos";
import { formatUTCDate, formatUTCDateLong } from "@/shared/utils/format";

const estadoColors: Record<string, string> = {
  CONFIRMADO: "bg-success-bg text-success",
  DEVUELTO: "bg-warning-bg text-warning",
  RETENIDO: "bg-warning-bg text-warning",
  ANULADO: "bg-danger-bg text-danger",
};

export default function PagosPage() {
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const { pagos, loading, error, fetchPagos, deletePago } = usePagos();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPago, setSelectedPago] = useState<Pago | null>(null);
  const [editingPago, setEditingPago] = useState<Pago | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Pago | null>(null);
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
      fecha_pago: formatUTCDate(p.fecha_pago),
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
            {isAdmin && <Button onClick={() => setIsModalOpen(true)}>+ Nuevo Pago</Button>}
          </div>
        }
      >
        {pagos.length === 0 ? (
          <EmptyState icon={<MdPayment className="w-10 h-10 text-text-muted/50" />} title="Sin pagos" description="Registra tu primer pago" action={isAdmin ? <Button onClick={() => setIsModalOpen(true)}>Registrar Pago</Button> : undefined} />
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-gradient-to-br from-accent-primary/10 to-accent-light/10 rounded-2xl p-5 border border-accent-primary/20">
                <p className="text-text-muted text-sm">Total Registrado</p>
                <p className="text-2xl font-bold font-display mt-1">{pagos[0]?.moneda || "USD"} {totalMonto.toFixed(2)}</p>
                <p className="text-text-muted text-xs mt-1">{pagos.length} transacciones</p>
              </div>
              <div className="bg-gradient-to-br from-success/30 to-success-bg rounded-2xl p-5 border border-success/20">
                <p className="text-text-muted text-sm">Confirmados</p>
                <p className="text-2xl font-bold font-display mt-1 text-success">{pagos[0]?.moneda || "USD"} {montoConfirmado.toFixed(2)}</p>
                <p className="text-text-muted text-xs mt-1">{pagos.filter(p => p.estado === "CONFIRMADO").length} pagos</p>
              </div>
              <div className="bg-gradient-to-br from-paper-medium/20 to-paper-medium/10 rounded-2xl p-5 border border-border-light/50">
                <p className="text-text-muted text-sm">Anulados/Devueltos</p>
                <p className="text-2xl font-bold font-display mt-1 text-danger">{pagos.filter(p => p.estado === "ANULADO" || p.estado === "DEVUELTO").length}</p>
                <p className="text-text-muted text-xs mt-1">transacciones</p>
              </div>
            </div>

            {/* Table container with flex-1 to fill available space */}
            <div className="flex flex-col flex-1 min-h-0">
              <PagosTable
                pagos={pagos}
                isAdmin={isAdmin}
                search={search}
                onSearchChange={setSearch}
                filterEstado={filterEstado}
                onFilterEstadoChange={setFilterEstado}
                page={page}
                onPageChange={setPage}
                perPage={perPage}
                onPerPageChange={setPerPage}
                onRowClick={setSelectedPago}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
                deleting={deleting}
              />
            </div>
          </>
        )}
      </PanelHeader>

      {isAdmin && <PagoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchPagos} />}
      {isAdmin && <PagoModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingPago(null); }} onSuccess={fetchPagos} pago={editingPago} />}

      {selectedPago && (
        <Modal isOpen={!!selectedPago} onClose={() => setSelectedPago(null)} title="Detalle del Pago">
          <div className="space-y-4">
            <div className="text-center py-4 bg-paper-medium/20 rounded-2xl">
              <p className="text-4xl font-bold font-display text-accent-primary">{selectedPago.moneda} {parseFloat(selectedPago.monto).toFixed(2)}</p>
              <p className="text-text-muted mt-2 text-sm">{selectedPago.concepto === "RESERVA" ? "Pago de Reserva" : "Pago de Consumo"}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-paper-medium/20 rounded-xl p-3"><p className="text-text-muted text-xs">Método</p><p className="text-sm font-medium">{metodoPagoLabels[selectedPago.metodo] ?? selectedPago.metodo}</p></div>
              <div className="bg-paper-medium/20 rounded-xl p-3">
                <p className="text-text-muted text-xs">Estado</p>
                <span className={cn("inline-block px-2 py-1 text-xs font-semibold rounded-full mt-1", estadoColors[selectedPago.estado] ?? "bg-bg-tertiary text-text-muted")}>{estadoPagoLabels[selectedPago.estado]}</span>
              </div>
            </div>
            <div className="bg-paper-medium/10 rounded-xl p-3">
              <p className="text-text-muted text-xs">Fecha de Pago</p>
              <p className="text-sm font-medium">{formatUTCDateLong(selectedPago.fecha_pago)}</p>
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
              {isAdmin && (
                <>
                  <button onClick={() => handleEdit(selectedPago)} className="flex-1 py-3 bg-accent-primary/10 text-accent-primary font-medium rounded-xl hover:bg-accent-primary/20 transition-all border border-accent-primary/20">Editar</button>
                  <button onClick={() => setDeleteTarget(selectedPago)} disabled={deleting} className="flex-1 py-3 bg-danger-bg text-danger font-medium rounded-xl hover:bg-danger-bg transition-all border border-danger/20 disabled:opacity-50">{deleting ? "Eliminando..." : "Eliminar"}</button>
                </>
              )}
              <button onClick={() => setSelectedPago(null)} className="flex-1 py-3 bg-paper-medium/20 text-text-muted font-medium rounded-xl hover:bg-paper-medium/30 transition-all border border-border">Cerrar</button>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar pago"
        description={
          deleteTarget
            ? `¿Eliminar pago de ${deleteTarget.moneda} ${parseFloat(deleteTarget.monto).toFixed(2)}?`
            : undefined
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
        isConfirmLoading={deleting}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const target = deleteTarget;
          setDeleteTarget(null);
          await handleDelete(target);
        }}
      />
    </>
  );
}
