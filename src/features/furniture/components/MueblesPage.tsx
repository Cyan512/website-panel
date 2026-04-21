import { useState } from "react";
import { PanelHeader, Button, Modal, ConfirmDialog } from "@/components";
import { useHabitaciones } from "@/features/rooms/hooks/useRooms";
import { MuebleModal } from "./MuebleModal";
import { MueblesGrid } from "./MueblesGrid";
import { muebleConditionLabels, muebleConditionColors } from "../types";
import type { Mueble, MuebleCondition } from "../types";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import { MdChair } from "react-icons/md";
import { cn } from "@/shared/utils/cn";
import { useMuebles } from "../hooks/useMuebles";
import { formatUTCDate } from "@/shared/utils/format";

export default function MueblesPage() {
  const {
    muebles,
    pagination,
    categorias,
    limit,
    filters,
    searchInput,
    loading,
    searching,
    error,
    fetchMuebles,
    goToPage,
    changeLimit,
    changeSearch,
    changeCategoria,
    changeCondicion,
    clearFilters,
    deleteMueble,
  } = useMuebles();

  const { habitaciones } = useHabitaciones();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMueble, setSelectedMueble] = useState<Mueble | null>(null);
  const [editingMueble, setEditingMueble] = useState<Mueble | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Mueble | null>(null);

  if (error)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-danger">{error}</div>
      </div>
    );

  const handleDelete = async (mueble?: Mueble) => {
    const target = mueble ?? selectedMueble;
    if (!target) return;
    setDeleting(true);
    try {
      await deleteMueble(target.id);
      if (target.id === selectedMueble?.id) setSelectedMueble(null);
    } catch (err) {
      if (!isHandledError(err)) {
        sileo.error({ title: "Error", description: "No se pudo eliminar el mueble" });
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (mueble: Mueble) => {
    setEditingMueble(mueble);
    setIsEditModalOpen(true);
    setSelectedMueble(null);
  };

  const getCategoryName = (mueble: Mueble) => {
    if (mueble.categoria?.nombre) return mueble.categoria.nombre;
    return categorias.find((c) => c.id === mueble.categoria_id)?.nombre;
  };

  const getRoomNro = (id: string | null) => (id ? habitaciones.find((h) => h.id === id)?.nro_habitacion : undefined);

  return (
    <>
      <PanelHeader
        title="Muebles"
        subtitle="Inventario de mobiliario por habitación"
        action={<Button onClick={() => setIsModalOpen(true)}>+ Nuevo Mueble</Button>}
      >
        {pagination.total === 0 && !searchInput && !filters.categoria && !filters.condicion ? (
          <div className="p-4 sm:p-6">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MdChair className="w-16 h-16 text-text-muted/30 mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">Sin muebles registrados</h3>
              <p className="text-text-muted mb-4">Comienza agregando tu primer mueble al inventario</p>
              <Button onClick={() => setIsModalOpen(true)}>Agregar Mueble</Button>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <MueblesGrid
              muebles={muebles}
              categorias={categorias}
              pagination={pagination}
              limit={limit}
              filters={filters}
              searchInput={searchInput}
              loading={loading}
              searching={searching}
              onPageChange={goToPage}
              onLimitChange={changeLimit}
              onSearch={changeSearch}
              onCategoriaChange={changeCategoria}
              onCondicionChange={changeCondicion}
              onClearFilters={clearFilters}
              onRowClick={setSelectedMueble}
              onEdit={handleEdit}
              onDelete={(m) => setDeleteTarget(m)}
              getCategoryName={getCategoryName}
              getRoomNro={getRoomNro}
            />
          </div>
        )}
      </PanelHeader>

      {/* Modal de creación */}
      <MuebleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchMuebles}
        categorias={categorias}
        habitaciones={habitaciones}
      />

      {/* Modal de edición */}
      <MuebleModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingMueble(null);
        }}
        onSuccess={fetchMuebles}
        mueble={editingMueble}
        categorias={categorias}
        habitaciones={habitaciones}
      />

      {/* Modal de detalle */}
      {selectedMueble && (
        <Modal isOpen={!!selectedMueble} onClose={() => setSelectedMueble(null)} title="Detalle del Mueble">
          <div className="max-h-[70vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="space-y-4">
              {selectedMueble.url_imagen && (
                <div className="w-full h-40 rounded-xl overflow-hidden bg-paper-medium/20">
                  <img
                    src={selectedMueble.url_imagen}
                    alt={selectedMueble.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="text-center py-3 bg-paper-medium/20 rounded-2xl">
                <p className="text-xl font-bold font-display text-accent-primary">{selectedMueble.nombre}</p>
                <p className="text-text-muted text-sm mt-0.5">{selectedMueble.codigo}</p>
                <span
                  className={cn(
                    "inline-block mt-2 text-xs font-medium px-3 py-1 rounded-full",
                    muebleConditionColors[selectedMueble.condicion as MuebleCondition],
                  )}
                >
                  {muebleConditionLabels[selectedMueble.condicion as MuebleCondition]}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-paper-medium/20 rounded-xl p-3">
                  <p className="text-text-muted text-xs">Categoría</p>
                  <p className="text-sm font-medium">
                    {getCategoryName(selectedMueble) ?? selectedMueble.categoria_id?.slice(0, 8) + "…"}
                  </p>
                </div>
                {selectedMueble.habitacion_id && (
                  <div className="bg-paper-medium/20 rounded-xl p-3">
                    <p className="text-text-muted text-xs">Habitación</p>
                    <p className="text-sm font-medium">
                      {getRoomNro(selectedMueble.habitacion_id)
                        ? `Nro. ${getRoomNro(selectedMueble.habitacion_id)}`
                        : selectedMueble.habitacion_id?.slice(0, 8) + "…"}
                    </p>
                  </div>
                )}
              </div>
              {(selectedMueble.fecha_adquisicion || selectedMueble.ultima_revision) && (
                <div className="grid grid-cols-2 gap-3">
                  {selectedMueble.fecha_adquisicion && (
                    <div className="bg-paper-medium/10 rounded-xl p-3">
                      <p className="text-text-muted text-xs">Adquisición</p>
                      <p className="text-sm font-medium">{formatUTCDate(selectedMueble.fecha_adquisicion)}</p>
                    </div>
                  )}
                  {selectedMueble.ultima_revision && (
                    <div className="bg-paper-medium/10 rounded-xl p-3">
                      <p className="text-text-muted text-xs">Última revisión</p>
                      <p className="text-sm font-medium">{formatUTCDate(selectedMueble.ultima_revision)}</p>
                    </div>
                  )}
                </div>
              )}
              {selectedMueble.descripcion && (
                <div className="bg-paper-medium/10 rounded-xl p-3">
                  <p className="text-text-muted text-xs">Descripción</p>
                  <p className="text-sm">{selectedMueble.descripcion}</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleEdit(selectedMueble)}
                  className="flex-1 py-3 bg-accent-primary/10 text-accent-primary font-medium rounded-xl hover:bg-accent-primary/20 transition-all border border-accent-primary/20"
                >
                  Editar
                </button>
                <button
                  onClick={() => setDeleteTarget(selectedMueble)}
                  disabled={deleting}
                  className="flex-1 py-3 bg-danger-bg text-danger font-medium rounded-xl hover:bg-danger-bg transition-all border border-danger/20 disabled:opacity-50"
                >
                  {deleting ? "..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmación de eliminación */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar mueble"
        description={deleteTarget ? `¿Eliminar el mueble "${deleteTarget.nombre}"?` : undefined}
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
