import { useState } from "react";
import { PanelHeader, Button, EmptyState, Loading, Modal, ConfirmDialog } from "@/components";
import { useTarifas } from "../hooks/useTarifas";
import { useTiposHabitacion } from "@/features/rooms/hooks/useRooms";
import { TarifaCard } from "./TarifaCard";
import { TarifaModal } from "./TarifaModal";
import type { Tarifa, CreateTarifa } from "../types";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import { MdLocalOffer } from "react-icons/md";
import { authClient } from "@/shared/lib/auth";

export default function TarifasPage() {
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const { tarifas, canales, loading, error, fetchTarifas, createTarifa, updateTarifa, deleteTarifa } = useTarifas();
  const { tipos: tiposHabitacion } = useTiposHabitacion();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTarifa, setEditingTarifa] = useState<Tarifa | null>(null);
  const [selectedTarifa, setSelectedTarifa] = useState<Tarifa | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading text="Cargando tarifas..." />
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-danger">{error}</div>
      </div>
    );

  const handleSave = async (data: CreateTarifa) => {
    if (editingTarifa) return updateTarifa(editingTarifa.id, data);
    return createTarifa(data);
  };

  const handleDelete = async () => {
    if (!selectedTarifa) return;

    setDeleting(true);
    try {
      await deleteTarifa(selectedTarifa.id);
      setSelectedTarifa(null);
    } catch (err) {
      if (!isHandledError(err)) {
        sileo.error({ title: "Error", description: "No se pudo eliminar la tarifa" });
      }
    } finally {
      setDeleting(false);
    }
  };

  const openCreate = () => {
    setEditingTarifa(null);
    setIsModalOpen(true);
  };
  const openEdit = (tarifa: Tarifa) => {
    setEditingTarifa(tarifa);
    setSelectedTarifa(null);
    setIsModalOpen(true);
  };

  return (
    <>
      <PanelHeader
        title="Tarifas"
        subtitle="Gestión de tarifas por canal y tipo de habitación"
        action={isAdmin ? <Button onClick={openCreate}>+ Nueva Tarifa</Button> : undefined}
      >
        {tarifas.length === 0 ? (
          <EmptyState
            icon={<MdLocalOffer className="w-10 h-10 text-text-muted/50" />}
            title="Sin tarifas"
            description="Crea tu primera tarifa"
            action={isAdmin ? <Button onClick={openCreate}>Crear Tarifa</Button> : undefined}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-6">
              <div className="bg-linear-to-br from-accent-primary/10 to-accent-light/10 rounded-2xl p-5 border border-accent-primary/20">
                <p className="text-text-muted text-sm">Total Tarifas</p>
                <p className="text-2xl font-bold font-display mt-1">{tarifas.length}</p>
              </div>
              <div className="bg-linear-to-br from-success/30 to-success-bg rounded-2xl p-5 border border-success/20">
                <p className="text-text-muted">Canales</p>
                <p className="text-2xl font-bold font-display mt-1 text-success">{canales.length}</p>
              </div>
              <div className="bg-linear-to-br from-paper-medium/20 to-paper-medium/10 rounded-2xl p-5 border border-border-light/50">
                <p className="text-text-muted text-sm">Tipos de Habitación</p>
                <p className="text-2xl font-bold font-display mt-1">{tiposHabitacion.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 sm:px-6 pb-6">
              {tarifas.map((tarifa) => (
                <TarifaCard key={tarifa.id} tarifa={tarifa} onClick={() => setSelectedTarifa(tarifa)} />
              ))}
            </div>
          </>
        )}
      </PanelHeader>

      {isAdmin && (
        <TarifaModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTarifa(null);
          }}
          onSuccess={fetchTarifas}
          tarifa={editingTarifa}
          tiposHabitacion={tiposHabitacion}
          canales={canales}
          onSave={handleSave}
        />
      )}

      {selectedTarifa && (
        <Modal isOpen={!!selectedTarifa} onClose={() => setSelectedTarifa(null)} title="Detalle de Tarifa">
          <div className="space-y-4">
            <div className="text-center py-4 bg-paper-medium/20 rounded-2xl">
              <p className="text-4xl font-bold font-display text-accent-primary">
                {selectedTarifa.moneda} {selectedTarifa.precio.toFixed(2)}
              </p>
              <p className="text-text-muted mt-1">por {selectedTarifa.unidad}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-paper-medium/20 rounded-xl p-3">
                <p className="text-text-muted text-xs">Tipo de Habitación</p>
                <p className="text-sm font-medium">{selectedTarifa.tipo_habitacion.nombre}</p>
              </div>
              <div className="bg-paper-medium/20 rounded-xl p-3">
                <p className="text-text-muted text-xs">Canal</p>
                <p className="text-sm font-medium">{selectedTarifa.canal.nombre}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {selectedTarifa.iva != null && (
                <div className="bg-paper-medium/10 rounded-xl p-3">
                  <p className="text-text-muted text-xs">IVA</p>
                  <p className="text-sm font-medium">{selectedTarifa.iva}%</p>
                </div>
              )}
              {selectedTarifa.cargo_servicios != null && (
                <div className="bg-paper-medium/10 rounded-xl p-3">
                  <p className="text-text-muted text-xs">Cargo Servicios</p>
                  <p className="font-medium">{selectedTarifa.cargo_servicios}%</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              {isAdmin && (
                <>
                  <button
                    onClick={() => openEdit(selectedTarifa)}
                    className="flex-1 py-3 bg-accent-primary/10 text-accent-primary font-medium rounded-xl hover:bg-accent-primary/20 transition-all border border-accent-primary/20"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setDeleteOpen(true)}
                    disabled={deleting}
                    className="flex-1 py-3 bg-danger-bg text-danger font-medium rounded-xl hover:bg-danger/15 transition-all border border-danger/25 disabled:opacity-50"
                  >
                    {deleting ? "Eliminando..." : "Eliminar"}
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedTarifa(null)}
                className="flex-1 py-3 bg-paper-medium/20 text-text-muted font-medium rounded-xl hover:bg-paper-medium/30 transition-all border border-border"
              >
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Eliminar tarifa"
        description={
          selectedTarifa ? `¿Eliminar la tarifa de "${selectedTarifa.tipo_habitacion.nombre} - ${selectedTarifa.canal.nombre}"?` : undefined
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
        isConfirmLoading={deleting}
        onConfirm={async () => {
          setDeleteOpen(false);
          await handleDelete();
        }}
      />
    </>
  );
}
