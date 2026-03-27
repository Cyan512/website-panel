import { useState } from "react";
import { PanelHeader, Button, EmptyState, Loading, Modal } from "@/components";
import { useHabitaciones } from "@/features/rooms/hooks/useRooms";
import { MuebleCard } from "./MuebleCard";
import { MuebleModal } from "./MuebleModal";
import { muebleConditionLabels, muebleConditionColors } from "../types";
import type { MuebleOutput, CreateMuebleInput, MuebleCondition } from "../types";
import { sileo } from "sileo";
import { MdChair } from "react-icons/md";
import { cn } from "@/utils/cn";
import { useMuebles } from "../hooks/useMuebles";

export default function MueblesPage() {
  const { muebles, categorias, loading, error, fetchMuebles, createMueble, updateMueble, deleteMueble } = useMuebles();
  const { habitaciones } = useHabitaciones();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMueble, setEditingMueble] = useState<MuebleOutput | null>(null);
  const [selectedMueble, setSelectedMueble] = useState<MuebleOutput | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [filterCondicion, setFilterCondicion] = useState<MuebleCondition | "">("");

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loading text="Cargando muebles..." /></div>;
  if (error) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-danger">{error}</div></div>;

  const handleSave = async (data: CreateMuebleInput) => {
    if (editingMueble) return updateMueble(editingMueble.id, data);
    return createMueble(data);
  };

  const handleDelete = async () => {
    if (!selectedMueble) return;
    const confirmed = window.confirm(`¿Eliminar el mueble "${selectedMueble.nombre}"?`);
    if (!confirmed) return;
    setDeleting(true);
    try {
      await deleteMueble(selectedMueble.id);
      setSelectedMueble(null);
    } catch {
      sileo.error({ title: "Error", description: "No se pudo eliminar el mueble" });
    } finally {
      setDeleting(false);
    }
  };

  const openCreate = () => { setEditingMueble(null); setIsModalOpen(true); };
  const openEdit = (m: MuebleOutput) => { setEditingMueble(m); setSelectedMueble(null); setIsModalOpen(true); };

  const filtered = filterCondicion ? muebles.filter((m) => m.condicion === filterCondicion) : muebles;

  return (
    <>
      <PanelHeader
        title="Muebles"
        subtitle="Inventario de mobiliario por habitación"
        action={<Button onClick={openCreate}>+ Nuevo Mueble</Button>}
      >
        {muebles.length === 0 ? (
          <EmptyState
            icon={<MdChair className="w-10 h-10 text-text-muted/50" />}
            title="Sin muebles"
            description="Registra el primer mueble"
            action={{ label: "Nuevo Mueble", onClick: openCreate }}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 sm:p-6">
              <div className="bg-gradient-to-br from-accent-primary/10 to-accent-light/10 rounded-2xl p-4 border border-accent-primary/20">
                <p className="text-text-muted text-xs">Total</p>
                <p className="text-2xl font-bold font-playfair mt-1">{muebles.length}</p>
              </div>
              {(["NUEVO", "BUENO", "MALO"] as MuebleCondition[]).map((c) => (
                <div key={c} className="bg-gradient-to-br from-paper-medium/20 to-paper-medium/10 rounded-2xl p-4 border border-border-light/50">
                  <p className="text-text-muted text-xs">{muebleConditionLabels[c]}</p>
                  <p className="text-2xl font-bold font-playfair mt-1">{muebles.filter((m) => m.condicion === c).length}</p>
                </div>
              ))}
            </div>

            <div className="px-4 sm:px-6 pb-4 flex gap-2 flex-wrap">
              <button onClick={() => setFilterCondicion("")} className={cn("text-xs px-3 py-1.5 rounded-full border transition-all", filterCondicion === "" ? "bg-accent-primary text-white border-accent-primary" : "border-border text-text-muted hover:border-accent-primary/50")}>
                Todos
              </button>
              {Object.entries(muebleConditionLabels).map(([key, label]) => (
                <button key={key} onClick={() => setFilterCondicion(key as MuebleCondition)} className={cn("text-xs px-3 py-1.5 rounded-full border transition-all", filterCondicion === key ? "bg-accent-primary text-white border-accent-primary" : "border-border text-text-muted hover:border-accent-primary/50")}>
                  {label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 sm:px-6 pb-6">
              {filtered.map((mueble) => (
                <MuebleCard key={mueble.id} mueble={mueble} onClick={() => setSelectedMueble(mueble)} />
              ))}
            </div>

            <div className="px-6 py-4 border-t border-border-light/30 flex gap-4 flex-wrap">
              {Object.entries(muebleConditionLabels).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <div className={cn("w-2.5 h-2.5 rounded-full", muebleConditionColors[key as MuebleCondition].split(" ")[0])} />
                  <span className="text-text-muted font-medium">{label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </PanelHeader>

      <MuebleModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingMueble(null); }}
        onSuccess={fetchMuebles}
        mueble={editingMueble}
        categorias={categorias}
        habitaciones={habitaciones}
        onSave={handleSave}
      />

      {selectedMueble && (
        <Modal isOpen={!!selectedMueble} onClose={() => setSelectedMueble(null)} title="Detalle del Mueble">
          <div className="space-y-4">
              {selectedMueble.imagen_url && (
                <div className="w-full h-40 rounded-xl overflow-hidden bg-paper-medium/20">
                  <img src={selectedMueble.imagen_url} alt={selectedMueble.nombre} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="text-center py-3 bg-paper-medium/20 rounded-2xl">
                <p className="text-xl font-bold font-playfair text-accent-primary">{selectedMueble.nombre}</p>
                <p className="text-text-muted text-sm mt-0.5">{selectedMueble.codigo}</p>
                <span className={cn("inline-block mt-2 text-xs font-medium px-3 py-1 rounded-full", muebleConditionColors[selectedMueble.condicion as MuebleCondition])}>
                  {muebleConditionLabels[selectedMueble.condicion as MuebleCondition]}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {selectedMueble.categoria && (
                  <div className="bg-paper-medium/20 rounded-xl p-3">
                    <p className="text-text-muted text-xs">Categoría</p>
                    <p className="text-sm font-medium">{selectedMueble.categoria.nombre}</p>
                  </div>
                )}
                {selectedMueble.habitacion && (
                  <div className="bg-paper-medium/20 rounded-xl p-3">
                    <p className="text-text-muted text-xs">Habitación</p>
                    <p className="text-sm font-medium">Nro. {selectedMueble.habitacion.nro_habitacion} — Piso {selectedMueble.habitacion.piso}</p>
                  </div>
                )}
              </div>
              {(selectedMueble.fecha_adquisicion || selectedMueble.ultima_revision) && (
                <div className="grid grid-cols-2 gap-3">
                  {selectedMueble.fecha_adquisicion && (
                    <div className="bg-paper-medium/10 rounded-xl p-3">
                      <p className="text-text-muted text-xs">Adquisición</p>
                      <p className="text-sm font-medium">{new Date(selectedMueble.fecha_adquisicion).toLocaleDateString("es-ES")}</p>
                    </div>
                  )}
                  {selectedMueble.ultima_revision && (
                    <div className="bg-paper-medium/10 rounded-xl p-3">
                      <p className="text-text-muted text-xs">Última revisión</p>
                      <p className="text-sm font-medium">{new Date(selectedMueble.ultima_revision).toLocaleDateString("es-ES")}</p>
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
                <button onClick={() => openEdit(selectedMueble)} className="flex-1 py-3 bg-accent-primary/10 text-accent-primary font-medium rounded-xl hover:bg-accent-primary/20 transition-all border border-accent-primary/20">Editar</button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 py-3 bg-red-50 text-danger font-medium rounded-xl hover:bg-red-100 transition-all border border-red-200 disabled:opacity-50">{deleting ? "..." : "Eliminar"}</button>
              </div>
          </div>
        </Modal>
      )}
    </>
  );
}
