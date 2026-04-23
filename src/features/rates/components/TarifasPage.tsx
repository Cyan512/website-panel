import { useState } from "react";
import { PanelHeader, Button, EmptyState, Loading, Modal, ConfirmDialog } from "@/components";
import { useTarifas } from "../hooks/useTarifas";
import { useTiposHabitacion } from "@/features/rooms/hooks/useRooms";
import { TarifaCard } from "./TarifaCard";
import { TarifaModal } from "./TarifaModal";
import type { Tarifa, CreateTarifa } from "../types";
import type { Canal, CreateCanal, UpdateCanal, TipoCanal } from "@/features/channels/types";
import { tipoCanalLabels } from "@/features/channels/types";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import { MdLocalOffer, MdEdit, MdDelete, MdHub } from "react-icons/md";
import { authClient } from "@/shared/lib/auth";

export default function TarifasPage() {
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const {
    tarifas,
    canales,
    loading,
    error,
    fetchTarifas,
    createTarifa,
    updateTarifa,
    deleteTarifa,
    createCanal,
    updateCanal,
    deleteCanal,
  } = useTarifas();
  const { tipos: tiposHabitacion } = useTiposHabitacion();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTarifa, setEditingTarifa] = useState<Tarifa | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingTarifa, setDeletingTarifa] = useState<Tarifa | null>(null);
  const [isCanalModalOpen, setIsCanalModalOpen] = useState(false);
  const [canalForm, setCanalForm] = useState({ nombre: "", tipo: "DIRECTO" as TipoCanal, notas: "" });
  const [editingCanal, setEditingCanal] = useState<Canal | null>(null);
  const [savingCanal, setSavingCanal] = useState(false);
  const [deleteCanalTarget, setDeleteCanalTarget] = useState<Canal | null>(null);

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
    if (!deletingTarifa) return;

    setDeleting(true);
    try {
      await deleteTarifa(deletingTarifa.id);
      setDeletingTarifa(null);
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
    setIsModalOpen(true);
  };

  const handleSaveCanal = async () => {
    if (!canalForm.nombre.trim()) {
      return sileo.error({ title: "Error", description: "El nombre es requerido" });
    }
    setSavingCanal(true);
    try {
      const data: CreateCanal | UpdateCanal = {
        nombre: canalForm.nombre.trim(),
        tipo: canalForm.tipo,
        notas: canalForm.notas.trim() || undefined,
      };
      if (editingCanal) {
        await updateCanal(editingCanal.id, data as UpdateCanal);
        sileo.success({ title: "Canal actualizado", description: data.nombre });
      } else {
        await createCanal(data as CreateCanal);
        sileo.success({ title: "Canal creado", description: data.nombre });
      }
      setCanalForm({ nombre: "", tipo: "DIRECTO", notas: "" });
      setEditingCanal(null);
    } catch (err) {
      if (!isHandledError(err)) {
        sileo.error({ title: "Error", description: "No se pudo guardar el canal" });
      }
    } finally {
      setSavingCanal(false);
    }
  };

  const handleEditCanal = (canal: Canal) => {
    setEditingCanal(canal);
    setCanalForm({ nombre: canal.nombre, tipo: canal.tipo, notas: canal.notas || "" });
  };

  const handleDeleteCanal = async () => {
    if (!deleteCanalTarget) return;
    try {
      await deleteCanal(deleteCanalTarget.id);
      sileo.success({ title: "Canal eliminado", description: deleteCanalTarget.nombre });
    } catch (err) {
      if (!isHandledError(err)) {
        sileo.error({ title: "Error", description: "No se pudo eliminar el canal" });
      }
    }
    setDeleteCanalTarget(null);
  };

  return (
    <>
      <PanelHeader
        title="Tarifas"
        subtitle="Gestión de tarifas por canal y tipo de habitación"
        action={
          isAdmin ? (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setIsCanalModalOpen(true)}>
                <MdHub className="w-4 h-4 mr-1" />
                Canales
              </Button>
              <Button onClick={openCreate}>+ Nueva Tarifa</Button>
            </div>
          ) : undefined
        }
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tarifas.map((tarifa) => (
                <TarifaCard
                  key={tarifa.id}
                  tarifa={tarifa}
                  onEdit={(e) => {
                    e.stopPropagation();
                    openEdit(tarifa);
                  }}
                  onDelete={(e) => {
                    e.stopPropagation();
                    setDeletingTarifa(tarifa);
                    setDeleteOpen(true);
                  }}
                />
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

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Eliminar tarifa"
        description={
          deletingTarifa ? `¿Eliminar la tarifa de "${deletingTarifa.tipo_habitacion.nombre} - ${deletingTarifa.canal.nombre}"?` : undefined
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

      <Modal
        isOpen={isCanalModalOpen}
        onClose={() => {
          setIsCanalModalOpen(false);
          setEditingCanal(null);
          setCanalForm({ nombre: "", tipo: "DIRECTO", notas: "" });
        }}
        title="Gestionar Canales"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-paper-medium/20 rounded-xl space-y-3">
            <h4 className="text-sm font-medium text-text-primary">{editingCanal ? "Editar Canal" : "Nuevo Canal"}</h4>
            <input
              type="text"
              value={canalForm.nombre}
              onChange={(e) => setCanalForm((f) => ({ ...f, nombre: e.target.value }))}
              placeholder="Nombre del canal"
              className="field-input w-full rounded-xl py-2.5 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50"
            />
            <select
              value={canalForm.tipo}
              onChange={(e) => setCanalForm((f) => ({ ...f, tipo: e.target.value as any }))}
              className="w-full rounded-xl py-2.5 text-sm px-3.5 border border-border-light/50 bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30"
            >
              {Object.entries(tipoCanalLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <textarea
              value={canalForm.notas}
              onChange={(e) => setCanalForm((f) => ({ ...f, notas: e.target.value }))}
              placeholder="Notas (opcional)"
              rows={2}
              className="field-input w-full rounded-xl py-2.5 text-sm px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50 resize-none"
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsCanalModalOpen(false);
                  setEditingCanal(null);
                  setCanalForm({ nombre: "", tipo: "DIRECTO", notas: "" });
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveCanal} isLoading={savingCanal} className="flex-1">
                {editingCanal ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-text-muted uppercase tracking-wider">Canales existentes</h4>
            {canales.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-4">No hay canales creados</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {canales.map((canal) => (
                  <div key={canal.id} className="flex items-center justify-between p-3 bg-bg-card rounded-xl border border-border">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{canal.nombre}</p>
                      <p className="text-xs text-text-muted">{tipoCanalLabels[canal.tipo]}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => handleEditCanal(canal)}
                        className="p-2 rounded-lg hover:bg-accent-primary/10 text-accent-primary transition-colors"
                        title="Editar"
                      >
                        <MdEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteCanalTarget(canal)}
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
        isOpen={!!deleteCanalTarget}
        onClose={() => setDeleteCanalTarget(null)}
        title="Eliminar canal"
        description={deleteCanalTarget ? `¿Estás seguro de que deseas eliminar "${deleteCanalTarget.nombre}"?` : undefined}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
        onConfirm={handleDeleteCanal}
      />
    </>
  );
}
