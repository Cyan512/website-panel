import { useState } from "react";
import { useInventory } from "../hooks/useInventory";
import { StockCard, CONDICION_LABELS } from "./StockCard";
import { StockModal } from "./StockModal";
import { PanelHeader, Button } from "@/components";
import { cn } from "@/utils/cn";
import type { Mueble } from "../types";

export default function InventoryPage() {
  const { muebles, loading, error, fetchMuebles, deleteMueble } = useInventory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMueble, setSelectedMueble] = useState<Mueble | null>(null);
  const [editingMueble, setEditingMueble] = useState<Mueble | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!selectedMueble) return;
    
    const confirmed = window.confirm(`¿Estás seguro de eliminar "${selectedMueble.nombre}"?`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteMueble(selectedMueble.id);
      setSelectedMueble(null);
    } catch (error) {
      console.error("Error deleting mueble:", error);
      alert("No se pudo eliminar el mueble. Puede estar en uso.");
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (mueble: Mueble, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMueble(mueble);
    setIsEditModalOpen(true);
    setSelectedMueble(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div>Cargando...</div></div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div>{error}</div></div>;
  }

  return (
    <>
      <PanelHeader title="Inventario" subtitle="Catálogo de mobiliario y equipos" action={<Button onClick={() => setIsModalOpen(true)}>+ Nuevo Mueble</Button>}>
        {muebles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-muted mb-4">Sin inventario</p>
            <Button onClick={() => setIsModalOpen(true)}>+ Agregar Mueble</Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 sm:p-6">
              {muebles.map((mueble) => (
                <StockCard key={mueble.id} mueble={mueble} onClick={() => setSelectedMueble(mueble)} />
              ))}
            </div>
            <div className="px-6 py-4 border-t border-border-light/30 flex gap-4 sm:gap-6 flex-wrap">
              {Object.entries(CONDICION_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2 text-xs">
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
          </>
        )}
      </PanelHeader>

      <StockModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchMuebles} />
      <StockModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingMueble(null); }} onSuccess={fetchMuebles} mueble={editingMueble} />
      
      {selectedMueble && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedMueble(null)}>
          <div className="bg-paper-lightest rounded-2xl w-full max-w-md border border-border-light/50 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-accent-primary to-accent-light px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-paper-lightest font-playfair">Detalle del Mueble</h2>
                <button onClick={() => setSelectedMueble(null)} className="p-1.5 rounded-lg bg-paper-lightest/20 hover:bg-paper-lightest/30 text-paper-lightest transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center",
                  selectedMueble.condicion === "BUENO" ? "bg-emerald-100" :
                  selectedMueble.condicion === "REGULAR" ? "bg-amber-100" :
                  selectedMueble.condicion === "DANADO" ? "bg-red-100" : "bg-stone-100"
                )}>
                  <svg className={cn("w-7 h-7",
                    selectedMueble.condicion === "BUENO" ? "text-emerald-600" :
                    selectedMueble.condicion === "REGULAR" ? "text-amber-600" :
                    selectedMueble.condicion === "DANADO" ? "text-red-600" : "text-stone-500"
                  )} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                </div>
                <div>
                  <p className="text-xl font-bold font-playfair">{selectedMueble.nombre}</p>
                  <p className="text-text-muted text-sm">{selectedMueble.codigo}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-paper-medium/20 rounded-xl p-3"><p className="text-text-muted text-xs">Categoría</p><p className="text-sm font-medium">{selectedMueble.categoria}</p></div>
                <div className="bg-paper-medium/20 rounded-xl p-3"><p className="text-text-muted text-xs">Tipo</p><p className="text-sm font-medium">{selectedMueble.tipo || "-"}</p></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-paper-medium/20 rounded-xl p-3"><p className="text-text-muted text-xs">Condición</p><span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${selectedMueble.condicion === "BUENO" ? "bg-emerald-100 text-emerald-700" : selectedMueble.condicion === "REGULAR" ? "bg-amber-100 text-amber-700" : selectedMueble.condicion === "DANADO" ? "bg-red-100 text-red-700" : "bg-stone-100 text-stone-600"}`}>{CONDICION_LABELS[selectedMueble.condicion]}</span></div>
                <div className="bg-paper-medium/20 rounded-xl p-3"><p className="text-text-muted text-xs">Adquisición</p><p className="text-sm font-medium">{selectedMueble.fecha_adquisicion ? new Date(selectedMueble.fecha_adquisicion).toLocaleDateString() : "-"}</p></div>
              </div>

              {selectedMueble.descripcion && <div className="bg-paper-medium/10 rounded-xl p-3"><p className="text-text-muted text-xs">Descripción</p><p className="text-sm">{selectedMueble.descripcion}</p></div>}

              <div className="flex gap-3 pt-2">
                <button onClick={(e) => handleEdit(selectedMueble, e)} className="flex-1 py-3 bg-accent-primary/10 text-accent-primary font-medium rounded-xl hover:bg-accent-primary/20 transition-all border border-accent-primary/20">Editar</button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 py-3 bg-red-50 text-danger font-medium rounded-xl hover:bg-red-100 transition-all border border-red-200 disabled:opacity-50">{deleting ? "Eliminando..." : "Eliminar"}</button>
              </div>
              <button onClick={() => setSelectedMueble(null)} className="w-full py-3 bg-paper-medium/30 text-text-dark font-medium rounded-xl hover:bg-paper-medium/50 transition-all border border-border-light/30">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
