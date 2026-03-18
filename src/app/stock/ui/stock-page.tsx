import { useEffect, useState } from "react";
import { authClient } from "@/config/authClient";
import { getMueblesService } from "@/app/stock/app/services/get-muebles.service";
import { getMuebleService } from "@/app/stock/app/services/get-mueble.service";
import { deleteMuebleService } from "@/app/stock/app/services/delete-mueble.service";
import type { Mueble } from "@/app/stock/dom/Mueble";
import { StockCard, CONDICION_LABELS } from "@/app/stock/ui/stock-card";
import { StockModal } from "./stock-modal";
import PanelHeader from "@/app/shared/components/panel-header";
import { Button, Loading, EmptyState } from "@/app/shared/components/ui";
import { cn } from "@/utils/cn";

export default function StockPage() {
  const { data: session } = authClient.useSession();
  const [muebles, setMuebles] = useState<Mueble[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMueble, setSelectedMueble] = useState<Mueble | null>(null);
  const [editingMueble, setEditingMueble] = useState<Mueble | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchMuebles = async () => {
    try {
      const data: any = await getMueblesService.execute();
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];
      setMuebles(items);
    } catch (error) {
      console.error("Error fetching muebles:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMuebleById = async (id: string) => {
    setLoadingDetail(true);
    try {
      const response: any = await getMuebleService.execute(id);
      const mueble = response?.data ? response.data : response;
      setSelectedMueble(mueble);
    } catch (error) {
      console.error("Error fetching mueble:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleEdit = (mueble: Mueble, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMueble(mueble);
    setIsEditModalOpen(true);
    setSelectedMueble(null);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedMueble) return;
    
    const confirmed = window.confirm(`¿Estás seguro de eliminar "${selectedMueble.nombre}"?`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteMuebleService.execute(selectedMueble.id);
      setSelectedMueble(null);
      fetchMuebles();
    } catch (error) {
      console.error("Error deleting mueble:", error);
      alert("No se pudo eliminar el mueble. Puede estar en uso.");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchMuebles();
    }
  }, [session]);

  const handleAddMueble = () => {
    setIsModalOpen(true);
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
          <p className="text-text-muted font-lora">Por favor, inicia sesión para ver el inventario</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loading text="Cargando inventario..." />;
  }

  return (
    <>
      <PanelHeader
        title="Inventario"
        subtitle="Catálogo de mobiliario y equipos"
        action={
          <Button onClick={handleAddMueble}>+ Nuevo Mueble</Button>
        }
      >
        {muebles.length === 0 ? (
          <EmptyState
            title="Sin inventario"
            description="Comienza agregando muebles al catálogo"
            action={{
              label: "Agregar Mueble",
              onClick: handleAddMueble,
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 sm:p-6">
            {muebles.map((mueble) => (
              <StockCard
                key={mueble.id}
                mueble={mueble}
                onClick={() => fetchMuebleById(mueble.id)}
              />
            ))}
          </div>
        )}

        {muebles.length > 0 && (
          <div className="px-6 py-4 border-t border-border-light/30 flex gap-4 sm:gap-6 flex-wrap">
            {Object.entries(CONDICION_LABELS).map(([key, label]) => (
              <div
                key={key}
                className="flex items-center gap-2 text-xs"
              >
                <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", {
                  "bg-emerald-500": key === "BUENO",
                  "bg-amber-500": key === "REGULAR",
                  "bg-red-500": key === "DANADO",
                  "bg-stone-400": key === "FALTANTE",
                })} />
                <span className="text-text-muted font-medium">{label}</span>
              </div>
            ))}
          </div>
        )}
      </PanelHeader>

      <StockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchMuebles}
      />

      <StockMquiodal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingMueble(null);
        }}
        onSuccess={fetchMuebles}
        mueble={editingMueble}
      />

      {selectedMueble && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMueble(null)}
        >
          <div
            className="bg-paper-lightest rounded-2xl w-full max-w-md border border-border-light/50 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-accent-primary to-accent-light px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-paper-lightest font-playfair">
                  Detalle del Mueble
                </h2>
                <button
                  onClick={() => setSelectedMueble(null)}
                  className="p-1.5 rounded-lg bg-paper-lightest/20 hover:bg-paper-lightest/30 text-paper-lightest transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {loadingDetail ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-3 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="p-6 space-y-5">
                <div className="bg-paper-medium/20 rounded-xl p-4 border border-border-light/30">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center",
                      selectedMueble.condicion === "BUENO" ? "bg-emerald-100" :
                      selectedMueble.condicion === "REGULAR" ? "bg-amber-100" :
                      selectedMueble.condicion === "DANADO" ? "bg-red-100" :
                      "bg-stone-100"
                    )}>
                      <svg className={cn(
                        "w-7 h-7",
                        selectedMueble.condicion === "BUENO" ? "text-emerald-600" :
                        selectedMueble.condicion === "REGULAR" ? "text-amber-600" :
                        selectedMueble.condicion === "DANADO" ? "text-red-600" :
                        "text-stone-500"
                      )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-text-muted text-xs uppercase tracking-wider font-medium">Nombre</p>
                      <p className="text-xl font-bold text-text-darkest font-playfair">{selectedMueble.nombre}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-text-muted text-[10px] uppercase tracking-wider font-medium">Código</p>
                      <p className="text-text-dark font-semibold">{selectedMueble.codigo}</p>
                    </div>
                    <div>
                      <p className="text-text-muted text-[10px] uppercase tracking-wider font-medium">Categoría</p>
                      <p className="text-text-dark font-semibold">{selectedMueble.categoria}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-paper-medium/20 rounded-xl p-4 border border-border-light/30">
                    <p className="text-text-muted text-[10px] uppercase tracking-wider font-medium mb-1">Tipo</p>
                    <p className="text-text-dark font-medium">{selectedMueble.tipo || "-"}</p>
                  </div>
                  <div className="bg-paper-medium/20 rounded-xl p-4 border border-border-light/30">
                    <p className="text-text-muted text-[10px] uppercase tracking-wider font-medium mb-1">Condición</p>
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                      selectedMueble.condicion === "BUENO"
                        ? "bg-emerald-100 text-emerald-700"
                        : selectedMueble.condicion === "REGULAR"
                          ? "bg-amber-100 text-amber-700"
                          : selectedMueble.condicion === "DANADO"
                            ? "bg-red-100 text-red-700"
                            : "bg-stone-100 text-stone-600"
                    }`}>
                      {CONDICION_LABELS[selectedMueble.condicion]}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-paper-medium/20 rounded-xl p-4 border border-border-light/30">
                    <p className="text-text-muted text-[10px] uppercase tracking-wider font-medium mb-1">Adquisición</p>
                    <p className="text-text-dark font-medium">
                      {selectedMueble.fecha_adquisicion
                        ? new Date(selectedMueble.fecha_adquisicion).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                  <div className="bg-paper-medium/20 rounded-xl p-4 border border-border-light/30">
                    <p className="text-text-muted text-[10px] uppercase tracking-wider font-medium mb-1">Última Revisión</p>
                    <p className="text-text-dark font-medium">
                      {selectedMueble.ultima_revision
                        ? new Date(selectedMueble.ultima_revision).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                </div>

                {selectedMueble.descripcion && (
                  <div className="bg-paper-medium/20 rounded-xl p-4 border border-border-light/30">
                    <p className="text-text-muted text-[10px] uppercase tracking-wider font-medium mb-1">Descripción</p>
                    <p className="text-text-dark">{selectedMueble.descripcion}</p>
                  </div>
                )}

                <div className="bg-paper-medium/10 rounded-xl p-3 border border-border-light/20">
                  <div className="flex justify-between text-xs">
                    <div>
                      <p className="text-text-muted">Creado</p>
                      <p className="text-text-secondary font-medium">
                        {new Date(selectedMueble.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-text-muted">Actualizado</p>
                      <p className="text-text-secondary font-medium">
                        {new Date(selectedMueble.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={(e) => handleEdit(selectedMueble, e)}
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
                  onClick={() => setSelectedMueble(null)}
                  className="w-full py-3 bg-paper-medium/30 text-text-dark font-medium rounded-xl hover:bg-paper-medium/50 transition-all border border-border-light/30"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
