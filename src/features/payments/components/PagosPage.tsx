import { useState } from "react";
import { authClient } from "@/config/authClient";
import { PanelHeader, Button, EmptyState, Loading, Modal } from "@/components";
import { PagoCard } from "./PagoCard";
import { PagoModal } from "./PagoModal";
import { sileo } from "sileo";
import { cn } from "@/utils/cn";
import { estadoPagoLabels } from "../types";
import type { Pago } from "../types";
import { MdPayment } from "react-icons/md";
import { utils, writeFile } from "xlsx";
import { usePagos } from "../hooks/usePagos";

export default function PagosPage() {
  const { data: session } = authClient.useSession();
  const { pagos, loading, error, fetchPagos, deletePago } = usePagos();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPago, setSelectedPago] = useState<Pago | null>(null);
  const [editingPago, setEditingPago] = useState<Pago | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (!session) {
    return <Loading text="Verificando sesión..." />;
  }

  const handleExport = () => {
    if (pagos.length === 0) {
      sileo.warning({ title: "Sin datos", description: "No hay pagos para exportar" });
      return;
    }

    const exportData = pagos.map((p) => ({
      id: p.id,
      concepto: p.concepto,
      estado: p.estado,
      fecha_pago: new Date(p.fecha_pago).toLocaleDateString(),
      monto: p.monto,
      moneda: p.moneda,
      metodo: p.metodo,
      receptor: p.recibido_por ? `${p.recibido_por.nombres} ${p.recibido_por.apellidos}` : "",
      notas: p.notas || "",
    }));

    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Pagos");

    const colWidths = [{ wch: 40 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 30 }, { wch: 40 }];
    ws["!cols"] = colWidths;

    const date = new Date().toISOString().split("T")[0];
    writeFile(wb, `pagos-kori-hotel-${date}.xlsx`);

    sileo.success({ title: "Exportación exitosa", description: "El archivo se descargará en breve" });
  };

  const handleDelete = async () => {
    if (!selectedPago) return;
    
    const confirmed = window.confirm(`¿Estás seguro de eliminar este pago de ${selectedPago.moneda} ${parseFloat(selectedPago.monto).toFixed(2)}?`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deletePago(selectedPago.id);
      setSelectedPago(null);
    } catch {
      sileo.error({ title: "Error", description: "No se pudo eliminar el pago" });
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (pago: Pago, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPago(pago);
    setIsEditModalOpen(true);
    setSelectedPago(null);
  };

  const totalPagos = pagos.reduce((acc, p) => acc + parseFloat(p.monto), 0);
  const pagosConfirmados = pagos.filter(p => p.estado === "CONFIRMADO" || p.estado === "APLICADO").reduce((acc, p) => acc + parseFloat(p.monto), 0);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loading text="Cargando pagos..." /></div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-danger">{error}</div></div>;
  }

  return (
    <>
      <PanelHeader
        title="Pagos"
        subtitle="Gestión de pagos y transacciones"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleExport}>
              Exportar
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>+ Nuevo Pago</Button>
          </div>
        }
      >
        {pagos.length === 0 ? (
          <EmptyState 
            icon={<MdPayment className="w-10 h-10 text-text-muted/50" />} 
            title="Sin pagos" 
            description="Registra tu primer pago"
            action={{ label: "Registrar Pago", onClick: () => setIsModalOpen(true) }}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-6">
              <div className="bg-gradient-to-br from-accent-primary/10 to-accent-light/10 rounded-2xl p-5 border border-accent-primary/20">
                <p className="text-text-muted text-sm">Total Registrado</p>
                <p className="text-2xl font-bold font-playfair mt-1">{pagos[0]?.moneda || "USD"} {totalPagos.toFixed(2)}</p>
                <p className="text-text-muted text-xs mt-1">{pagos.length} transacciones</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-5 border border-emerald-200/50">
                <p className="text-text-muted text-sm">Confirmados/Aplicados</p>
                <p className="text-2xl font-bold font-playfair mt-1 text-emerald-700">{pagos[0]?.moneda || "USD"} {pagosConfirmados.toFixed(2)}</p>
                <p className="text-text-muted text-xs mt-1">{pagos.filter(p => p.estado === "CONFIRMADO" || p.estado === "APLICADO").length} pagos</p>
              </div>
              <div className="bg-gradient-to-br from-paper-medium/20 to-paper-medium/10 rounded-2xl p-5 border border-border-light/50">
                <p className="text-text-muted text-sm">Anulados/Devueltos</p>
                <p className="text-2xl font-bold font-playfair mt-1 text-red-700">
                  {pagos.filter(p => p.estado === "ANULADO" || p.estado === "DEVUELTO").length}
                </p>
                <p className="text-text-muted text-xs mt-1">transacciones</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 sm:px-6 pb-6">
              {pagos.map((pago) => (
                <PagoCard key={pago.id} pago={pago} onClick={() => setSelectedPago(pago)} />
              ))}
            </div>

            <div className="px-6 py-4 border-t border-border-light/30 flex gap-4 sm:gap-6 flex-wrap">
              {Object.entries(estadoPagoLabels).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", {
                    "bg-emerald-500": key === "CONFIRMADO",
                    "bg-blue-500": key === "APLICADO",
                    "bg-amber-500": key === "DEVUELTO",
                    "bg-orange-500": key === "RETENIDO",
                    "bg-red-500": key === "ANULADO",
                  })} />
                  <span className="text-text-muted font-medium">{label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </PanelHeader>

      <PagoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchPagos} />
      <PagoModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingPago(null); }} onSuccess={fetchPagos} pago={editingPago} />
      
      {selectedPago && (
        <Modal isOpen={!!selectedPago} onClose={() => setSelectedPago(null)} title="Detalle del Pago">
          <div className="space-y-5">
              <div className="text-center py-4 bg-paper-medium/20 rounded-2xl">
                <p className="text-4xl font-bold font-playfair text-accent-primary">{selectedPago.moneda} {parseFloat(selectedPago.monto).toFixed(2)}</p>
                <p className="text-text-muted mt-2">{selectedPago.concepto === "RESERVA" ? "Pago de Reserva" : "Pago de Consumo"}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-paper-medium/20 rounded-xl p-3"><p className="text-text-muted text-xs">Método</p><p className="text-sm font-medium">{selectedPago.metodo}</p></div>
                <div className="bg-paper-medium/20 rounded-xl p-3">
                  <p className="text-text-muted text-xs">Estado</p>
                  <span className={cn("inline-block px-2 py-1 text-xs font-semibold rounded-full mt-1",
                    selectedPago.estado === "CONFIRMADO" ? "bg-emerald-100 text-emerald-700" :
                    selectedPago.estado === "APLICADO" ? "bg-blue-100 text-blue-700" :
                    selectedPago.estado === "DEVUELTO" ? "bg-amber-100 text-amber-700" :
                    selectedPago.estado === "RETENIDO" ? "bg-orange-100 text-orange-700" :
                    "bg-red-100 text-red-700"
                  )}>{estadoPagoLabels[selectedPago.estado]}</span>
                </div>
              </div>
              <div className="bg-paper-medium/10 rounded-xl p-3">
                <p className="text-text-muted text-xs">Fecha de Pago</p>
                <p className="text-sm font-medium">{new Date(selectedPago.fecha_pago).toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
              </div>
              {selectedPago.recibido_por && (
                <div className="bg-paper-medium/10 rounded-xl p-3">
                  <p className="text-text-muted text-xs">Recibido por</p>
                  <p className="text-sm font-medium">{selectedPago.recibido_por.nombres} {selectedPago.recibido_por.apellidos}</p>
                </div>
              )}
              {selectedPago.notas && (
                <div className="bg-paper-medium/10 rounded-xl p-3">
                  <p className="text-text-muted text-xs">Notas</p>
                  <p className="text-sm">{selectedPago.notas}</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={(e) => handleEdit(selectedPago, e)} className="flex-1 py-3 bg-accent-primary/10 text-accent-primary font-medium rounded-xl hover:bg-accent-primary/20 transition-all border border-accent-primary/20">Editar</button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 py-3 bg-red-50 text-danger font-medium rounded-xl hover:bg-red-100 transition-all border border-red-200 disabled:opacity-50">{deleting ? "Eliminando..." : "Eliminar"}</button>
              </div>
          </div>
        </Modal>
      )}
    </>
  );
}
