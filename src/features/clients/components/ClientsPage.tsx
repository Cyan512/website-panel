import { useState } from "react";
import { authClient } from "@/config/authClient";
import { PanelHeader, Button, EmptyState, Loading } from "@/components";
import { useHuespedes } from "../hooks/useHuespedes";
import { HuespedCard } from "./HuespedCard";
import { HuespedModal } from "./HuespedModal";
import { sileo } from "sileo";
import type { Huesped } from "../types";
import { MdPeople, MdEmail, MdPhone, MdPerson, MdNotes } from "react-icons/md";
import { HuespedTable } from "./HuespedTable";

export default function ClientsPage() {
  const { data: session } = authClient.useSession();
  const { huespedes, loading, error, fetchHuespedes, deleteHuesped } = useHuespedes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedHuesped, setSelectedHuesped] = useState<Huesped | null>(null);
  const [editingHuesped, setEditingHuesped] = useState<Huesped | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (!session) {
    return <Loading text="Verificando sesión..." />;
  }

  const handleDelete = async () => {
    if (!selectedHuesped) return;
    
    const confirmed = window.confirm(`¿Estás seguro de eliminar a ${selectedHuesped.nombres} ${selectedHuesped.apellidos}?`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteHuesped(selectedHuesped.id);
      setSelectedHuesped(null);
    } catch {
      sileo.error({ title: "Error", description: "No se pudo eliminar el huésped. Puede tener reservas asociadas." });
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (huesped: Huesped, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingHuesped(huesped);
    setIsEditModalOpen(true);
    setSelectedHuesped(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loading text="Cargando huéspedes..." /></div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-danger">{error}</div></div>;
  }

  return (
    <>
      <PanelHeader
        title="Huéspedes"
        subtitle="Gestión de clientes y huéspedes del hotel"
        action={<Button onClick={() => setIsModalOpen(true)}>+ Nuevo Huésped</Button>}
      >
        {huespedes.length === 0 ? (
          <EmptyState 
            icon={<MdPeople className="w-10 h-10 text-text-muted/50" />} 
            title="Sin huéspedes" 
            description="Comienza agregando tu primer huésped"
            action={{ label: "Agregar Huésped", onClick: () => setIsModalOpen(true) }}
          />
        ) : (
          <div className="p-4 sm:p-6">
            <HuespedTable huespedes={huespedes} onRowClick={(huesped) => setSelectedHuesped(huesped)} />
          </div>
        )}
      </PanelHeader>

      <HuespedModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchHuespedes} />
      <HuespedModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingHuesped(null); }} onSuccess={fetchHuespedes} huesped={editingHuesped} />
      
      {selectedHuesped && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedHuesped(null)}>
          <div className="bg-paper-lightest rounded-2xl w-full max-w-md border border-border-light/50 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-accent-primary to-accent-light px-6 py-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-paper-lightest font-playfair">Detalle del Huésped</h2>
                <button onClick={() => setSelectedHuesped(null)} className="p-1.5 rounded-lg bg-paper-lightest/20 hover:bg-paper-lightest/30 text-paper-lightest transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">

              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-paper-medium/20 rounded-xl p-3">
                  <MdEmail className="w-5 h-5 text-text-muted flex-shrink-0" />
                  <div>
                    <p className="text-text-muted text-xs">Email</p>
                    <p className="text-sm font-medium">{selectedHuesped.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-paper-medium/20 rounded-xl p-3">
                  <MdPhone className="w-5 h-5 text-text-muted flex-shrink-0" />
                  <div>
                    <p className="text-text-muted text-xs">Teléfono</p>
                    <p className="text-sm font-medium">{selectedHuesped.telefono}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-paper-medium/20 rounded-xl p-3">
                  <MdPerson className="w-5 h-5 text-text-muted flex-shrink-0" />
                  <div>
                    <p className="text-text-muted text-xs">Nacionalidad</p>
                    <p className="text-sm font-medium">{selectedHuesped.nacionalidad}</p>
                  </div>
                </div>
                {selectedHuesped.observacion && (
                  <div className="flex items-start gap-3 bg-paper-medium/10 rounded-xl p-3">
                    <MdNotes className="w-5 h-5 text-text-muted flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-text-muted text-xs">Observacion</p>
                      <p className="text-sm">{selectedHuesped.observacion}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={(e) => handleEdit(selectedHuesped, e)} className="flex-1 py-3 bg-accent-primary/10 text-accent-primary font-medium rounded-xl hover:bg-accent-primary/20 transition-all border border-accent-primary/20">Editar</button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 py-3 bg-red-50 text-danger font-medium rounded-xl hover:bg-red-100 transition-all border border-red-200 disabled:opacity-50">{deleting ? "Eliminando..." : "Eliminar"}</button>
              </div>
              <button onClick={() => setSelectedHuesped(null)} className="w-full py-3 bg-paper-medium/30 text-text-dark font-medium rounded-xl hover:bg-paper-medium/50 transition-all border border-border-light/30">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
