import { useState } from "react";
import { PanelHeader, Button, Modal, ConfirmDialog } from "@/components";
import { useHabitaciones } from "@/features/rooms/hooks/useRooms";
import { MuebleModal } from "./MuebleModal";
import { MueblesGrid } from "./MueblesGrid";
import type { Mueble, CreateCategoriaMueble } from "../types";
import type { CategoriaMueble } from "@/features/furniture-categories/types";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import { MdChair, MdCategory, MdEdit, MdDelete } from "react-icons/md";
import { useMuebles } from "../hooks/useMuebles";

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
    createCategoria,
    updateCategoria,
    deleteCategoria,
  } = useMuebles();

  const { habitaciones } = useHabitaciones();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMueble, setEditingMueble] = useState<Mueble | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Mueble | null>(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [viewingMueble, setViewingMueble] = useState<Mueble | null>(null);
  const [isCategoriaModalOpen, setIsCategoriaModalOpen] = useState(false);
  const [categoriaForm, setCategoriaForm] = useState({ nombre: "" });
  const [editingCategoria, setEditingCategoria] = useState<CategoriaMueble | null>(null);
  const [savingCategoria, setSavingCategoria] = useState(false);
  const [deleteCategoriaTarget, setDeleteCategoriaTarget] = useState<CategoriaMueble | null>(null);

  if (error)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-danger">{error}</div>
      </div>
    );

  const handleDelete = async (mueble: Mueble) => {
    setDeleting(true);
    try {
      await deleteMueble(mueble.id);
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
  };

  const handleViewImage = (mueble: Mueble) => {
    setViewingMueble(mueble);
    setImageViewerOpen(true);
  };

  const handleSaveCategoria = async () => {
    if (!categoriaForm.nombre.trim()) {
      return sileo.error({ title: "Error", description: "El nombre es requerido" });
    }
    setSavingCategoria(true);
    try {
      const data: CreateCategoriaMueble = {
        nombre: categoriaForm.nombre.trim(),
      };
      if (editingCategoria) {
        await updateCategoria(editingCategoria.id, data);
        sileo.success({ title: "Categoría actualizada", description: data.nombre });
      } else {
        await createCategoria(data);
        sileo.success({ title: "Categoría creada", description: data.nombre });
      }
      setCategoriaForm({ nombre: "" });
      setEditingCategoria(null);
    } catch (err) {
      if (!isHandledError(err)) {
        sileo.error({ title: "Error", description: "No se pudo guardar la categoría" });
      }
    } finally {
      setSavingCategoria(false);
    }
  };

  const handleEditCategoria = (categoria: CategoriaMueble) => {
    setEditingCategoria(categoria);
    setCategoriaForm({ nombre: categoria.nombre.toUpperCase() });
  };

  const handleDeleteCategoria = async () => {
    if (!deleteCategoriaTarget) return;
    try {
      await deleteCategoria(deleteCategoriaTarget.id);
      sileo.success({ title: "Categoría eliminada", description: deleteCategoriaTarget.nombre });
    } catch (err) {
      if (!isHandledError(err)) {
        sileo.error({ title: "Error", description: "No se pudo eliminar la categoría" });
      }
    }
    setDeleteCategoriaTarget(null);
  };

  const getRoomNro = (id: string | null) => (id ? habitaciones.find((h) => h.id === id)?.nro_habitacion : undefined);

  return (
    <>
      <PanelHeader
        title="Muebles"
        subtitle="Inventario de mobiliario por habitación"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsCategoriaModalOpen(true)}>
              <MdCategory className="w-4 h-4 mr-1" />
              Categorías
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>+ Nuevo Mueble</Button>
          </div>
        }
      >
        {pagination.total === 0 && !searchInput && !filters.categoria && !filters.condicion ? (
          <div className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <MdChair className="w-16 h-16 text-text-muted/30 mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">Sin muebles registrados</h3>
              <p className="text-text-muted mb-4">Comienza agregando tu primer mueble al inventario</p>
              <Button onClick={() => setIsModalOpen(true)}>Agregar Mueble</Button>
            </div>
          </div>
        ) : (
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
            onEdit={handleEdit}
            onDelete={(m) => setDeleteTarget(m)}
            onViewImage={handleViewImage}
            getRoomNro={getRoomNro}
          />
        )}
      </PanelHeader>

      <MuebleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchMuebles}
        habitaciones={habitaciones}
        categorias={categorias}
      />

      <MuebleModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingMueble(null);
        }}
        onSuccess={fetchMuebles}
        mueble={editingMueble}
        habitaciones={habitaciones}
        categorias={categorias}
      />

      <Modal isOpen={imageViewerOpen} onClose={() => setImageViewerOpen(false)} title={viewingMueble?.nombre ?? "Imagen del Mueble"} size="xl">
        {viewingMueble && (viewingMueble.url_imagen || viewingMueble.imagenes?.length) && (
          <div className="flex items-center justify-center">
            <img
              src={viewingMueble.url_imagen || viewingMueble.imagenes?.[0]}
              alt={viewingMueble.nombre}
              className="max-h-[70vh] object-contain rounded-xl"
            />
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isCategoriaModalOpen}
        onClose={() => {
          setIsCategoriaModalOpen(false);
          setEditingCategoria(null);
          setCategoriaForm({ nombre: "" });
        }}
        title="Gestionar Categorías"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-paper-medium/20 rounded-xl space-y-3">
            <h4 className="text-sm font-medium text-text-primary">{editingCategoria ? "Editar Categoría" : "Nueva Categoría"}</h4>
            <input
              type="text"
              value={categoriaForm.nombre}
              onChange={(e) => setCategoriaForm({ nombre: e.target.value.toUpperCase() })}
              placeholder="Nombre de la categoría"
              className="field-input w-full rounded-xl py-2.5 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50"
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingCategoria(null);
                  setCategoriaForm({ nombre: "" });
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveCategoria} isLoading={savingCategoria} className="flex-1">
                {editingCategoria ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-text-muted uppercase tracking-wider">Categorías existentes</h4>
            {categorias.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">No hay categorías creadas</p>
            ) : (
              <div className="space-y-2 max-h-50 overflow-y-auto">
                {categorias.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between p-3 bg-bg-card rounded-xl border border-border">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{cat.nombre}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => handleEditCategoria(cat)}
                        className="p-2 rounded-lg hover:bg-accent-primary/10 text-accent-primary transition-colors"
                        title="Editar"
                      >
                        <MdEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteCategoriaTarget(cat)}
                        className="p-2 rounded-lg hover:bg-danger/10 text-danger transition-colors"
                        title="Eliminar"
                      >
                        <MdDelete className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar mueble"
        description={deleteTarget ? `¿Estás seguro de que deseas eliminar "${deleteTarget.nombre}"? Esta acción no se puede deshacer.` : undefined}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
        isConfirmLoading={deleting}
        confirmationText="eliminar"
        confirmationLabel="Para confirmar, escribe 'eliminar'"
        onConfirm={async () => {
          if (!deleteTarget) return;
          const target = deleteTarget;
          setDeleteTarget(null);
          await handleDelete(target);
        }}
      />

      <ConfirmDialog
        isOpen={!!deleteCategoriaTarget}
        onClose={() => setDeleteCategoriaTarget(null)}
        title="Eliminar categoría"
        description={deleteCategoriaTarget ? `¿Estás seguro de que deseas eliminar "${deleteCategoriaTarget.nombre}"?` : undefined}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
        onConfirm={handleDeleteCategoria}
      />
    </>
  );
}
