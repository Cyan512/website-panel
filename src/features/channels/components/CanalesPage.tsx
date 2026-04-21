import { useState } from "react";
import { PanelHeader, Button, EmptyState, Loading, Modal } from "@/components";
import { CanalCard } from "./CanalCard";
import { CanalModal } from "./CanalModal";
import { tipoCanalLabels, tipoCanalColors } from "../types";
import type { Canal, CreateCanal } from "../types";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import { MdHub } from "react-icons/md";
import { cn } from "@/shared/utils/cn";
import { useCanales } from "../hooks/useCanales";
import { authClient } from "@/shared/lib/auth";

export default function CanalesPage() {
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const { canales, loading, error, fetchCanales, createCanal, updateCanal, deleteCanal } = useCanales();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCanal, setEditingCanal] = useState<Canal | null>(null);
  const [selectedCanal, setSelectedCanal] = useState<Canal | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loading text="Cargando canales..." /></div>;
  if (error) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-danger">{error}</div></div>;

  const handleSave = async (data: CreateCanal) => {
    if (editingCanal) return updateCanal(editingCanal.id, data);
    return createCanal(data);
  };

  const handleDelete = async () => {
    if (!selectedCanal) return;
    const confirmed = window.confirm(`¿Eliminar el canal "${selectedCanal.nombre}"?`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteCanal(selectedCanal.id);
      setSelectedCanal(null);
    } catch (err) {
      if (!isHandledError(err)) { sileo.error({ title: "Error", description: "No se pudo eliminar el canal" }); }
    } finally {
      setDeleting(false);
    }
  };

  const openCreate = () => { setEditingCanal(null); setIsModalOpen(true); };
  const openEdit = (canal: Canal) => { setEditingCanal(canal); setSelectedCanal(null); setIsModalOpen(true); };

  const activos = canales.filter((c) => c.activo).length;

  return (
    <>
      <PanelHeader
        title="Canales"
        subtitle="Gestión de canales de distribución"
        action={isAdmin ? <Button onClick={openCreate}>+ Nuevo Canal</Button> : undefined}
      >
        {canales.length === 0 ? (
          <EmptyState
            icon={<MdHub className="w-10 h-10 text-text-muted/50" />}
            title="Sin canales"
            description="Crea tu primer canal de distribución"
            action={isAdmin ? <Button onClick={openCreate}>Crear Canal</Button> : undefined}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-6">
              <div className="bg-gradient-to-br from-accent-primary/10 to-accent-light/10 rounded-2xl p-5 border border-accent-primary/20">
                <p className="text-text-muted text-sm">Total Canales</p>
                <p className="text-2xl font-bold font-playfair mt-1">{canales.length}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-40 to-emerald-100/50 rounded-2xl p-5 border border-emerald-200/50">
                <p className="text-text-muted text-sm">Activos</p>
                <p className="text-2xl font-bold font-playfair mt-1 text-emerald-500">{activos}</p>
              </div>
              <div className="bg-gradient-to-br from-paper-medium/20 to-paper-medium/10 rounded-2xl p-5 border border-border-light/50">
                <p className="text-text-muted text-sm">Inactivos</p>
                <p className="text-2xl font-bold font-playfair mt-1">{canales.length - activos}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 sm:px-6 pb-6">
              {canales.map((canal) => (
                <CanalCard key={canal.id} canal={canal} onClick={() => setSelectedCanal(canal)} />
              ))}
            </div>

            <div className="px-6 py-4 border-t border-border-light/30 flex gap-4 flex-wrap">
              {Object.entries(tipoCanalLabels).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <div className={cn("w-2.5 h-2.5 rounded-full", tipoCanalColors[key as keyof typeof tipoCanalColors].split(" ")[0].replace("bg-", "bg-"))} />
                  <span className="text-text-muted font-medium">{label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </PanelHeader>

      {isAdmin && (
        <CanalModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingCanal(null); }}
          onSuccess={fetchCanales}
          canal={editingCanal}
          onSave={handleSave}
        />
      )}

      {selectedCanal && (
        <Modal isOpen={!!selectedCanal} onClose={() => setSelectedCanal(null)} title="Detalle del Canal">
          <div className="space-y-4">
              <div className="text-center py-4 bg-paper-medium/20 rounded-2xl">
                <p className="text-2xl font-bold font-playfair text-accent-primary">{selectedCanal.nombre}</p>
                <span className={cn("inline-block mt-2 text-xs font-medium px-3 py-1 rounded-full", tipoCanalColors[selectedCanal.tipo])}>
                  {tipoCanalLabels[selectedCanal.tipo]}
                </span>
              </div>
              <div className="bg-paper-medium/20 rounded-xl p-3">
                <p className="text-text-muted text-xs">Estado</p>
                <span className={cn("inline-block px-2 py-1 text-xs font-semibold rounded-full mt-1", selectedCanal.activo ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600")}>
                  {selectedCanal.activo ? "Activo" : "Inactivo"}
                </span>
              </div>
              {selectedCanal.notas && (
                <div className="bg-paper-medium/10 rounded-xl p-3">
                  <p className="text-text-muted text-xs">Notas</p>
                  <p className="text-sm">{selectedCanal.notas}</p>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                {isAdmin && (
                  <>
                    <button onClick={() => openEdit(selectedCanal)} className="flex-1 py-3 bg-accent-primary/10 text-accent-primary font-medium rounded-xl hover:bg-accent-primary/20 transition-all border border-accent-primary/20">Editar</button>
                    <button onClick={handleDelete} disabled={deleting} className="flex-1 py-3 bg-red-50 text-danger font-medium rounded-xl hover:bg-red-100 transition-all border border-red-200 disabled:opacity-50">{deleting ? "Eliminando..." : "Eliminar"}</button>
                  </>
                )}
                <button onClick={() => setSelectedCanal(null)} className="flex-1 py-3 bg-paper-medium/20 text-text-muted font-medium rounded-xl hover:bg-paper-medium/30 transition-all border border-border">Cerrar</button>
              </div>
          </div>
        </Modal>
      )}
    </>
  );
}
