import { useState } from "react";
import { PanelHeader, Button, EmptyState, Loading, Modal } from "@/components";
import { useHabitaciones } from "@/features/rooms/hooks/useRooms";
import { useHuespedes } from "@/features/clients/hooks/useHuespedes";
import { EstanciaCard } from "./EstanciaCard";
import { EstanciaModal } from "./EstanciaModal";
import { CheckoutModal } from "./CheckoutModal";
import { estadoEstadiaLabels, estadoEstadiaColors } from "../types";
import type { EstanciaOutput, CreateEstanciaInput } from "../types";
import { sileo } from "sileo";
import { MdHotel } from "react-icons/md";
import { cn } from "@/utils/cn";
import { useEstancias } from "../hooks/useEstancias";

export default function EstanciasPage() {
  const { estancias, loading, error, fetchEstancias, createEstancia, updateEstancia, checkoutEstancia, deleteEstancia } = useEstancias();
  const { habitaciones } = useHabitaciones();
  const { huespedes } = useHuespedes();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [editingEstancia, setEditingEstancia] = useState<EstanciaOutput | null>(null);
  const [selectedEstancia, setSelectedEstancia] = useState<EstanciaOutput | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loading text="Cargando estancias..." /></div>;
  if (error) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-danger">{error}</div></div>;

  const handleSave = async (data: CreateEstanciaInput) => {
    if (editingEstancia) return updateEstancia(editingEstancia.id, data);
    return createEstancia(data);
  };

  const handleDelete = async () => {
    if (!selectedEstancia) return;
    const confirmed = window.confirm(`¿Eliminar la estancia de "${selectedEstancia.huesped.nombres} ${selectedEstancia.huesped.apellidos}"?`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteEstancia(selectedEstancia.id);
      setSelectedEstancia(null);
    } catch {
      sileo.error({ title: "Error", description: "No se pudo eliminar la estancia" });
    } finally {
      setDeleting(false);
    }
  };

  const openCreate = () => { setEditingEstancia(null); setIsModalOpen(true); };
  const openEdit = (e: EstanciaOutput) => { setEditingEstancia(e); setSelectedEstancia(null); setIsModalOpen(true); };
  const openCheckout = (e: EstanciaOutput) => { setSelectedEstancia(null); setEditingEstancia(e); setIsCheckoutOpen(true); };

  const activas = estancias.filter((e) => e.estado === "ACTIVA").length;

  return (
    <>
      <PanelHeader
        title="Estancias"
        subtitle="Gestión de estancias y check-outs"
        action={<Button onClick={openCreate}>+ Nueva Estancia</Button>}
      >
        {estancias.length === 0 ? (
          <EmptyState
            icon={<MdHotel className="w-10 h-10 text-text-muted/50" />}
            title="Sin estancias"
            description="Registra la primera estancia"
            action={{ label: "Nueva Estancia", onClick: openCreate }}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-6">
              <div className="bg-gradient-to-br from-accent-primary/10 to-accent-light/10 rounded-2xl p-5 border border-accent-primary/20">
                <p className="text-text-muted text-sm">Total</p>
                <p className="text-2xl font-bold font-playfair mt-1">{estancias.length}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-5 border border-emerald-200/50">
                <p className="text-text-muted text-sm">Activas</p>
                <p className="text-2xl font-bold font-playfair mt-1 text-emerald-700">{activas}</p>
              </div>
              <div className="bg-gradient-to-br from-paper-medium/20 to-paper-medium/10 rounded-2xl p-5 border border-border-light/50">
                <p className="text-text-muted text-sm">Check-out / Canceladas</p>
                <p className="text-2xl font-bold font-playfair mt-1">{estancias.length - activas}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 sm:px-6 pb-6">
              {estancias.map((estancia) => (
                <EstanciaCard key={estancia.id} estancia={estancia} onClick={() => setSelectedEstancia(estancia)} />
              ))}
            </div>

            <div className="px-6 py-4 border-t border-border-light/30 flex gap-4 flex-wrap">
              {Object.entries(estadoEstadiaLabels).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <div className={cn("w-2.5 h-2.5 rounded-full", estadoEstadiaColors[key as keyof typeof estadoEstadiaColors].split(" ")[0])} />
                  <span className="text-text-muted font-medium">{label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </PanelHeader>

      <EstanciaModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingEstancia(null); }}
        onSuccess={fetchEstancias}
        estancia={editingEstancia}
        habitaciones={habitaciones}
        huespedes={huespedes}
        onSave={handleSave}
      />

      {editingEstancia && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => { setIsCheckoutOpen(false); setEditingEstancia(null); }}
          onSuccess={fetchEstancias}
          estancia={editingEstancia}
          onCheckout={checkoutEstancia}
        />
      )}

      {selectedEstancia && (
        <Modal isOpen={!!selectedEstancia} onClose={() => setSelectedEstancia(null)} title="Detalle de Estancia">
          <div className="space-y-4">
              <div className="text-center py-4 bg-paper-medium/20 rounded-2xl">
                <p className="text-xl font-bold font-playfair text-accent-primary">{selectedEstancia.huesped.nombres} {selectedEstancia.huesped.apellidos}</p>
                <p className="text-text-muted text-sm mt-1">Hab. {selectedEstancia.habitacion.nro_habitacion} — Piso {selectedEstancia.habitacion.piso}</p>
                <span className={cn("inline-block mt-2 text-xs font-medium px-3 py-1 rounded-full", estadoEstadiaColors[selectedEstancia.estado])}>
                  {estadoEstadiaLabels[selectedEstancia.estado]}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-paper-medium/20 rounded-xl p-3">
                  <p className="text-text-muted text-xs">Entrada</p>
                  <p className="text-sm font-medium">{new Date(selectedEstancia.fechaEntrada).toLocaleString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <div className="bg-paper-medium/20 rounded-xl p-3">
                  <p className="text-text-muted text-xs">Salida</p>
                  <p className="text-sm font-medium">{selectedEstancia.fechaSalida ? new Date(selectedEstancia.fechaSalida).toLocaleString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "—"}</p>
                </div>
              </div>
              {selectedEstancia.notas && (
                <div className="bg-paper-medium/10 rounded-xl p-3">
                  <p className="text-text-muted text-xs">Notas</p>
                  <p className="text-sm">{selectedEstancia.notas}</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                {selectedEstancia.estado === "ACTIVA" && (
                  <button onClick={() => openCheckout(selectedEstancia)} className="flex-1 py-3 bg-blue-50 text-blue-700 font-medium rounded-xl hover:bg-blue-100 transition-all border border-blue-200">Check-out</button>
                )}
                <button onClick={() => openEdit(selectedEstancia)} className="flex-1 py-3 bg-accent-primary/10 text-accent-primary font-medium rounded-xl hover:bg-accent-primary/20 transition-all border border-accent-primary/20">Editar</button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 py-3 bg-red-50 text-danger font-medium rounded-xl hover:bg-red-100 transition-all border border-red-200 disabled:opacity-50">{deleting ? "..." : "Eliminar"}</button>
              </div>
          </div>
        </Modal>
      )}
    </>
  );
}
