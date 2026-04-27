import { useState } from "react";
import { useHabitaciones } from "../hooks/useRooms";
import { RoomModal } from "./RoomModal";
import { RoomsGrid } from "./RoomsGrid";
import { RoomCalendarModal } from "./RoomCalendarModal";
import { ImageCarousel } from "./ImageCarousel";
import { PanelHeader, Button, Modal, ConfirmDialog } from "@/components";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import { MdCategory, MdEdit, MdDelete, MdLanguage } from "react-icons/md";
import { I18nModal } from "./I18nModal";
import type { Habitacion, TipoHabitacion } from "../types";
import { useTiposHabitacion } from "@/features/room-types/hooks/useTiposHabitacion";

export default function RoomsPage() {
  const {
    habitaciones, pagination, limit, filters, searchInput, loading, searching,
    fetchHabitaciones, goToPage, changeLimit, changeSearch, changeTipo, changeEstado, clearFilters,
    deleteHabitacion,
  } = useHabitaciones();

  const { tipos, createTipo, updateTipo, deleteTipo } = useTiposHabitacion();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingHabitacion, setEditingHabitacion] = useState<Habitacion | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Habitacion | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isTipoModalOpen, setIsTipoModalOpen] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoHabitacion | null>(null);
  const [tipoForm, setTipoForm] = useState({ nombre: "" });
  const [savingTipo, setSavingTipo] = useState(false);
  const [deleteTipoTarget, setDeleteTipoTarget] = useState<TipoHabitacion | null>(null);
  const [isI18nModalOpen, setIsI18nModalOpen] = useState(false);

  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [calendarTarget, setCalendarTarget] = useState<Habitacion | null>(null);
  const [imagesModalOpen, setImagesModalOpen] = useState(false);
  const [imagesTarget, setImagesTarget] = useState<Habitacion | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteHabitacion(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      if (!isHandledError(err)) sileo.error({ title: "Error", description: "No se pudo eliminar la habitación." });
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (habitacion: Habitacion) => {
    setEditingHabitacion(habitacion);
    setIsEditModalOpen(true);
  };

  const handleDeleteCard = (habitacion: Habitacion) => {
    setDeleteTarget(habitacion);
    setDeleteOpen(true);
  };

  const handleViewCalendar = (habitacion: Habitacion) => {
    setCalendarTarget(habitacion);
    setCalendarModalOpen(true);
  };

  const handleViewImages = (habitacion: Habitacion) => {
    setImagesTarget(habitacion);
    setCarouselIndex(0);
    setImagesModalOpen(true);
  };

  const handleSaveTipo = async () => {
    if (!tipoForm.nombre.trim()) {
      return sileo.error({ title: "Error", description: "El nombre es requerido" });
    }
    setSavingTipo(true);
    try {
      if (editingTipo) {
        await updateTipo(editingTipo.id, { nombre: tipoForm.nombre.trim() });
        sileo.success({ title: "Tipo actualizado", description: tipoForm.nombre });
      } else {
        await createTipo({ nombre: tipoForm.nombre.trim() });
        sileo.success({ title: "Tipo creado", description: tipoForm.nombre });
      }
      setTipoForm({ nombre: "" });
      setEditingTipo(null);
    } catch (err) {
      if (!isHandledError(err)) {
        sileo.error({ title: "Error", description: "No se pudo guardar el tipo de habitación" });
      }
    } finally {
      setSavingTipo(false);
    }
  };

  const handleEditTipo = (tipo: TipoHabitacion) => {
    setEditingTipo(tipo);
    setTipoForm({ nombre: tipo.nombre });
  };

  const handleDeleteTipo = async () => {
    if (!deleteTipoTarget) return;
    try {
      await deleteTipo(deleteTipoTarget.id);
      sileo.success({ title: "Tipo eliminado", description: deleteTipoTarget.nombre });
    } catch (err) {
      if (!isHandledError(err)) {
        sileo.error({ title: "Error", description: "No se pudo eliminar el tipo de habitación" });
      }
    }
    setDeleteTipoTarget(null);
  };

  return (
    <>
      <PanelHeader
        title="Habitaciones"
        subtitle="Gestión y estado de habitaciones"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsTipoModalOpen(true)}>
              <MdCategory className="w-4 h-4 mr-1" />
              Tipos
            </Button>
            <Button variant="secondary" onClick={() => setIsI18nModalOpen(true)}>
              <MdLanguage className="w-4 h-4 mr-1" />
              Internacionalización
            </Button>
            <Button
              onClick={() => {
                setEditingHabitacion(null);
                setIsModalOpen(true);
              }}
            >
              + Nueva Habitación
            </Button>
          </div>
        }
      >
        <RoomsGrid
          habitaciones={habitaciones}
          pagination={pagination}
          limit={limit}
          tipos={tipos}
          searchInput={searchInput}
          filters={filters}
          loading={loading}
          searching={searching}
          onPageChange={goToPage}
          onLimitChange={changeLimit}
          onSearch={changeSearch}
          onTipoChange={changeTipo}
          onEstadoChange={changeEstado}
          onClearFilters={clearFilters}
          onEdit={handleEdit}
          onDelete={handleDeleteCard}
          onViewCalendar={handleViewCalendar}
          onViewImages={handleViewImages}
        />
      </PanelHeader>

      <RoomModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHabitacion(null);
        }}
        onSuccess={fetchHabitaciones}
        tipos={tipos}
      />

      <RoomModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingHabitacion(null);
        }}
        onSuccess={fetchHabitaciones}
        habitacion={editingHabitacion}
        tipos={tipos}
      />

      <I18nModal
        isOpen={isI18nModalOpen}
        onClose={() => setIsI18nModalOpen(false)}
        habitaciones={habitaciones}
      />

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Eliminar habitación"
        description={deleteTarget ? `¿Eliminar la habitación ${deleteTarget.nro_habitacion}?` : undefined}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
        isConfirmLoading={deleting}
        confirmationText="eliminar"
        onConfirm={async () => {
          setDeleteOpen(false);
          await handleDelete();
        }}
      />

      <RoomCalendarModal
        isOpen={calendarModalOpen}
        onClose={() => {
          setCalendarModalOpen(false);
          setCalendarTarget(null);
        }}
        habitacion={calendarTarget}
      />

      {imagesTarget?.url_imagen && imagesTarget.url_imagen.length > 0 && (
        <ImageCarousel
          images={imagesTarget.url_imagen}
          isOpen={imagesModalOpen}
          onClose={() => {
            setImagesModalOpen(false);
            setImagesTarget(null);
          }}
          title={`Habitación ${imagesTarget.nro_habitacion}`}
          initialIndex={carouselIndex}
        />
      )}

      <Modal
        isOpen={isTipoModalOpen}
        onClose={() => {
          setIsTipoModalOpen(false);
          setEditingTipo(null);
          setTipoForm({ nombre: "" });
        }}
        title="Gestionar Tipos de Habitación"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-paper-medium/20 rounded-xl space-y-3">
            <h4 className="text-sm font-medium text-text-primary">{editingTipo ? "Editar Tipo" : "Nuevo Tipo"}</h4>
            <input
              type="text"
              value={tipoForm.nombre}
              onChange={(e) => setTipoForm({ ...tipoForm, nombre: e.target.value.toUpperCase() })}
              placeholder="Nombre del tipo"
              className="field-input w-full rounded-xl py-2.5 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50"
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingTipo(null);
                  setTipoForm({ nombre: "" });
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveTipo} isLoading={savingTipo} className="flex-1">
                {editingTipo ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-text-muted uppercase tracking-wider">Tipos existentes</h4>
            {tipos.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">No hay tipos creados</p>
            ) : (
              <div className="space-y-2 max-h-50 overflow-y-auto">
                {tipos.map((tipo) => (
                  <div key={tipo.id} className="flex items-center justify-between p-3 bg-bg-card rounded-xl border border-border">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{tipo.nombre}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => handleEditTipo(tipo)}
                        className="p-2 rounded-lg hover:bg-accent-primary/10 text-accent-primary transition-colors"
                        title="Editar"
                      >
                        <MdEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTipoTarget(tipo)}
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
        isOpen={!!deleteTipoTarget}
        onClose={() => setDeleteTipoTarget(null)}
        title="Eliminar tipo de habitación"
        description={deleteTipoTarget ? `¿Estás seguro de que deseas eliminar "${deleteTipoTarget.nombre}"?` : undefined}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
        onConfirm={handleDeleteTipo}
      />
    </>
  );
}
