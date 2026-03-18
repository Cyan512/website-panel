import { useEffect, useState } from "react";
import { authClient } from "@/config/authClient";
import { getTiposHabitacionService } from "@/app/room/app/services/get-tipos-habitacion.service";
import { deleteTipoHabitacionService } from "@/app/room/app/services/delete-tipo-habitacion.service";
import type { TipoHabitacion } from "@/app/room/dom/TipoHabitacion";
import { TipoHabitacionCard } from "@/app/room/ui/tipo-habitacion-card";
import { TipoHabitacionModal } from "@/app/room/ui/tipo-habitacion-modal";
import PanelHeader from "@/app/shared/components/panel-header";
import { Button, Modal, Loading, EmptyState, Card, CardBody } from "@/app/shared/components/ui";
import { cn } from "@/utils/cn";

export default function TipoHabitacionPage() {
  const { data: session } = authClient.useSession();
  const [tipos, setTipos] = useState<TipoHabitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<TipoHabitacion | null>(null);
  const [editingTipo, setEditingTipo] = useState<TipoHabitacion | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTipos = async () => {
    try {
      const data = await getTiposHabitacionService.execute();
      const tiposData = Array.isArray(data) ? data : (data as { data?: TipoHabitacion[] }).data || [];
      setTipos(tiposData);
    } catch (error) {
      console.error("Error fetching tipos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTipo) return;
    
    const confirmed = window.confirm(`¿Estás seguro de eliminar "${selectedTipo.nombre}"?`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteTipoHabitacionService.execute(selectedTipo.id);
      setSelectedTipo(null);
      fetchTipos();
    } catch (error) {
      console.error("Error deleting tipo:", error);
      alert("No se pudo eliminar el tipo de habitación. Puede estar en uso.");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchTipos();
    }
  }, [session]);

  const handleAddTipo = () => {
    setIsModalOpen(true);
  };

  const handleEdit = (tipo: TipoHabitacion, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTipo(tipo);
    setIsEditModalOpen(true);
    setSelectedTipo(null);
  };

  if (!session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-paper-medium/50 flex items-center justify-center">
            <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-text-muted font-lora">Por favor, inicia sesión para ver los tipos de habitación</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loading text="Cargando tipos de habitación..." />;
  }

  return (
    <>
      <PanelHeader
        title="Tipos de Habitación"
        subtitle="Gestión de categorías de habitaciones"
        action={
          <Button onClick={handleAddTipo}>+ Nuevo Tipo</Button>
        }
      >
        {tipos.length === 0 ? (
          <EmptyState
            title="No hay tipos de habitación"
            description="Comienza agregando el primer tipo de habitación del hotel"
            action={{
              label: "Agregar Tipo",
              onClick: handleAddTipo,
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 sm:p-6">
            {tipos.map((tipo) => (
              <TipoHabitacionCard
                key={tipo.id}
                tipo={tipo}
                onClick={() => setSelectedTipo(tipo)}
              />
            ))}
          </div>
        )}
      </PanelHeader>

      <TipoHabitacionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTipos}
      />

      <TipoHabitacionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTipo(null);
        }}
        onSuccess={fetchTipos}
        tipo={editingTipo}
      />
      
      {selectedTipo && (
        <Modal
          isOpen={!!selectedTipo}
          onClose={() => setSelectedTipo(null)}
          title={selectedTipo.nombre}
        >
          <div className="space-y-4">
              <Card className="bg-paper-medium/20 border-0">
                <CardBody>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold bg-accent-primary/10 text-accent-primary">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-text-muted text-xs uppercase tracking-wider font-medium">Tipo de Habitación</p>
                      <p className="text-2xl font-bold text-text-darkest font-playfair">
                        {selectedTipo.nombre}
                      </p>
                    </div>
                  </div>

                  {selectedTipo.descripcion && (
                    <div className="mb-4">
                      <p className="text-text-muted text-[10px] uppercase tracking-wider font-medium">Descripción</p>
                      <p className="text-text-dark">{selectedTipo.descripcion}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-text-muted text-[10px] uppercase tracking-wider font-medium">Ducha</p>
                      <span className={cn(
                        "inline-block px-3 py-1 text-xs font-semibold rounded-full",
                        selectedTipo.tiene_ducha
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-stone-100 text-stone-500"
                      )}>
                        {selectedTipo.tiene_ducha ? "Sí" : "No"}
                      </span>
                    </div>
                    <div>
                      <p className="text-text-muted text-[10px] uppercase tracking-wider font-medium">Baño</p>
                      <span className={cn(
                        "inline-block px-3 py-1 text-xs font-semibold rounded-full",
                        selectedTipo.tiene_banio
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-stone-100 text-stone-500"
                      )}>
                        {selectedTipo.tiene_banio ? "Sí" : "No"}
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <div className="bg-paper-medium/10 rounded-xl p-3 border border-border-light/20">
                <p className="text-text-muted text-[10px] uppercase tracking-wider font-medium mb-2">
                  Muebles asociados ({selectedTipo.muebles?.length || 0})
                </p>
                {selectedTipo.muebles && selectedTipo.muebles.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedTipo.muebles.map((mueble) => (
                      <span key={mueble.id} className="px-2 py-1 text-xs bg-paper-medium/30 rounded-lg text-text-dark">
                        {mueble.nombre}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-muted text-sm">No hay muebles asociados</p>
                )}
              </div>

              <div className="bg-paper-medium/10 rounded-xl p-3 border border-border-light/20">
                <div className="flex justify-between text-xs">
                  <div>
                    <p className="text-text-muted">Creado</p>
                    <p className="text-text-secondary font-medium">
                      {new Date(selectedTipo.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-text-muted">Actualizado</p>
                    <p className="text-text-secondary font-medium">
                      {new Date(selectedTipo.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={(e) => handleEdit(selectedTipo, e)}
                  className="flex-1 py-3 bg-accent-primary/10 text-accent-primary font-medium rounded-xl hover:bg-accent-primary/20 transition-all flex items-center justify-center gap-2 border border-accent-primary/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-3 bg-red-50 text-danger font-medium rounded-xl hover:bg-red-100 transition-all flex items-center justify-center gap-2 border border-red-200 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {deleting ? "Eliminando..." : "Eliminar"}
                </button>
              </div>

              <button
                onClick={() => setSelectedTipo(null)}
                className="w-full py-3 bg-paper-medium/30 text-text-dark font-medium rounded-xl hover:bg-paper-medium/50 transition-all border border-border-light/30"
              >
                Cerrar
              </button>
            </div>
        </Modal>
      )}
    </>
  );
}
