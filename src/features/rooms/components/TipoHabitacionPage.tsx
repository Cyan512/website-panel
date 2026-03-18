import { useState } from "react";
import { useTiposHabitacion } from "../hooks/useRooms";
import { TipoHabitacionCard } from "./TipoHabitacionCard";
import { TipoHabitacionModal } from "./TipoHabitacionModal";
import { PanelHeader, Button, Modal } from "@/components";
import { cn } from "@/utils/cn";
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
    } catch (error) {
      console.error("Error deleting tipo:", error);
      alert("No se pudo eliminar el tipo de habitación. Puede estar en uso.");
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
                <p className="text-2xl font-bold font-playfair">{selectedTipo.nombre}</p>
                {selectedTipo.descripcion && <p className="text-text-muted text-sm">{selectedTipo.descripcion}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-paper-medium/20 rounded-xl p-3">
                <p className="text-text-muted text-xs">Ducha</p>
                <span className={cn("inline-block px-3 py-1 text-xs font-semibold rounded-full mt-1", selectedTipo.tiene_ducha ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500")}>
                  {selectedTipo.tiene_ducha ? "Sí" : "No"}
                </span>
              </div>
              <div className="bg-paper-medium/20 rounded-xl p-3">
                <p className="text-text-muted text-xs">Baño</p>
                <span className={cn("inline-block px-3 py-1 text-xs font-semibold rounded-full mt-1", selectedTipo.tiene_banio ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500")}>
                  {selectedTipo.tiene_banio ? "Sí" : "No"}
                </span>
              </div>
            </div>

            <div className="bg-paper-medium/10 rounded-xl p-3">
              <p className="text-text-muted text-xs mb-2">Muebles asociados ({selectedTipo.muebles?.length || 0})</p>
              {selectedTipo.muebles && selectedTipo.muebles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedTipo.muebles.map((mueble) => (
                    <span key={mueble.id} className="px-2 py-1 text-xs bg-paper-medium/30 rounded-lg">{mueble.nombre}</span>
                  ))}
                </div>
              ) : (
                <p className="text-text-muted text-sm">No hay muebles asociados</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={(e) => handleEdit(selectedTipo, e)} className="flex-1 py-3 bg-accent-primary/10 text-accent-primary font-medium rounded-xl hover:bg-accent-primary/20 transition-all border border-accent-primary/20">
                Editar
              </button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-3 bg-red-50 text-danger font-medium rounded-xl hover:bg-red-100 transition-all border border-red-200 disabled:opacity-50">
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
