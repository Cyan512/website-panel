import { useState } from "react";
import { useTiposHabitacion } from "../hooks/useRooms";
import { TipoHabitacionCard } from "./TipoHabitacionCard";
import { TipoHabitacionModal } from "./TipoHabitacionModal";
import { PanelHeader, Button, Modal } from "@/components";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import type { TipoHabitacion } from "../types";

export default function TipoHabitacionPage() {
  const { tipos, loading, error, fetchTipos, deleteTipo } = useTiposHabitacion();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<TipoHabitacion | null>(null);
  const [editingTipo, setEditingTipo] = useState<TipoHabitacion | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!selectedTipo) return;
    
    const confirmed = window.confirm(`¿Estás seguro de eliminar "${selectedTipo.nombre}"?`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteTipo(selectedTipo.id);
      setSelectedTipo(null);
    } catch (err) {
      if (!isHandledError(err)) { sileo.error({ title: "Error", description: "No se pudo eliminar el tipo de habitación. Puede estar en uso." }); }
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (tipo: TipoHabitacion, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTipo(tipo);
    setIsEditModalOpen(true);
    setSelectedTipo(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div>Cargando...</div></div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div>{error}</div></div>;
  }

  return (
    <>
      <PanelHeader
        title="Tipos de Habitación"
        subtitle="Gestión de categorías de habitaciones"
        action={<Button onClick={() => setIsModalOpen(true)}>+ Nuevo Tipo</Button>}
      >
        {tipos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-muted mb-4">No hay tipos de habitación</p>
            <Button onClick={() => setIsModalOpen(true)}>+ Agregar Tipo</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 sm:p-6">
            {tipos.map((tipo) => (
              <TipoHabitacionCard key={tipo.id} tipo={tipo} onClick={() => setSelectedTipo(tipo)} />
            ))}
          </div>
        )}
      </PanelHeader>

      <TipoHabitacionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchTipos} />

      <TipoHabitacionModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingTipo(null); }}
        onSuccess={fetchTipos}
        tipo={editingTipo}
      />
      
      {selectedTipo && (
        <Modal isOpen={!!selectedTipo} onClose={() => setSelectedTipo(null)} title={selectedTipo.nombre}>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold bg-accent-primary/10 text-accent-primary">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold font-display">{selectedTipo.nombre}</p>
                {selectedTipo.descripcion && <p className="text-text-muted text-sm">{selectedTipo.descripcion}</p>}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={(e) => handleEdit(selectedTipo, e)} className="flex-1 py-3 bg-accent-primary/10 text-accent-primary font-medium rounded-xl hover:bg-accent-primary/20 transition-all border border-accent-primary/20">
                Editar
              </button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-3 bg-danger-bg text-danger font-medium rounded-xl hover:bg-danger-bg transition-all border border-danger/20 disabled:opacity-50">
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>

            <button onClick={() => setSelectedTipo(null)} className="w-full py-3 bg-paper-medium/30 text-text-dark font-medium rounded-xl hover:bg-paper-medium/50 transition-all border border-border-light/30">
              Cerrar
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
