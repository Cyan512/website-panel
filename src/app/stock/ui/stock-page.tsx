import { useEffect, useState } from "react";
import { authClient } from "@/config/authClient";
import { getMueblesService } from "@/app/stock/app/services/get-muebles.service";
import { getMuebleService } from "@/app/stock/app/services/get-mueble.service";
import { deleteMuebleService } from "@/app/stock/app/services/delete-mueble.service";
import type { Mueble } from "@/app/stock/dom/Mueble";
import { StockCard, CONDICION_LABELS } from "@/app/stock/ui/stock-card";
import { StockModal } from "./stock-modal";
import PanelHeader from "@/app/shared/components/panel-header";
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

  if (!session) {
    return <div>Por favor, inicia sesión para ver el catálogo de muebles</div>;
  }

  if (loading) {
    return <div>Cargando catálogo de muebles...</div>;
  }

  return (
    <PanelHeader
      title="Catálogo de Mueble"
      subtitle="Inventario y estado del mobiliario"
    >
      <div className="flex justify-end p-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors"
        >
          + Nuevo Mueble
        </button>
      </div>

      {muebles.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-stone-500">No hay muebles en el catálogo</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3 p-4">
          {muebles.map((mueble) => (
            <StockCard
              key={mueble.id}
              mueble={mueble}
              onClick={() => fetchMuebleById(mueble.id)}
            />
          ))}
        </div>
      )}

      <div className="px-4 py-2.5 border-t flex gap-3.5 flex-wrap relative z-10">
        {Object.entries(CONDICION_LABELS).map(([key, label]) => (
          <div
            key={key}
            className="flex items-center gap-1.5 text-xs italic"
          >
            <div className={cn("w-2 h-2 rounded-full", {
              "bg-emerald-500": key === "BUENO",
              "bg-amber-500": key === "REGULAR",
              "bg-red-500": key === "DANADO",
              "bg-stone-500": key === "FALTANTE",
            })} />
            {label}
          </div>
        ))}
      </div>

      <StockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchMuebles}
      />

      <StockModal
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
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMueble(null)}
        >
          <div
            className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl p-6 w-full max-w-md border border-stone-700/50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-stone-100">
                Detalle del Mueble
              </h2>
              <button
                onClick={() => setSelectedMueble(null)}
                className="text-stone-400 hover:text-stone-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loadingDetail ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center">
                      <svg className="w-5 h-5 text-stone-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-stone-400 text-xs uppercase tracking-wider">Nombre</p>
                      <p className="text-xl font-bold text-stone-100">{selectedMueble.nombre}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-stone-500 text-xs uppercase">Código</p>
                      <p className="text-stone-200 font-medium">{selectedMueble.codigo}</p>
                    </div>
                    <div>
                      <p className="text-stone-500 text-xs uppercase">Categoría</p>
                      <p className="text-stone-200 font-medium">{selectedMueble.categoria}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700/50">
                    <p className="text-stone-500 text-xs uppercase mb-1">Tipo</p>
                    <p className="text-stone-200 font-medium">{selectedMueble.tipo || "-"}</p>
                  </div>
                  <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700/50">
                    <p className="text-stone-500 text-xs uppercase mb-1">Condición</p>
                    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${
                      selectedMueble.condicion === "BUENO"
                        ? "bg-emerald-700/20 text-emerald-400 border-emerald-700/30"
                        : selectedMueble.condicion === "REGULAR"
                          ? "bg-amber-700/20 text-amber-400 border-amber-700/30"
                          : selectedMueble.condicion === "DANADO"
                            ? "bg-red-700/20 text-red-400 border-red-700/30"
                            : "bg-stone-700/20 text-stone-400 border-stone-700/30"
                    }`}>
                      {CONDICION_LABELS[selectedMueble.condicion]}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700/50">
                    <p className="text-stone-500 text-xs uppercase mb-1">Adquisición</p>
                    <p className="text-stone-200 font-medium">
                      {selectedMueble.fecha_adquisicion
                        ? new Date(selectedMueble.fecha_adquisicion).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                  <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700/50">
                    <p className="text-stone-500 text-xs uppercase mb-1">Última Revisión</p>
                    <p className="text-stone-200 font-medium">
                      {selectedMueble.ultima_revision
                        ? new Date(selectedMueble.ultima_revision).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                </div>

                {selectedMueble.descripcion && (
                  <div className="bg-stone-800/50 rounded-xl p-4 border border-stone-700/50">
                    <p className="text-stone-500 text-xs uppercase mb-1">Descripción</p>
                    <p className="text-stone-200">{selectedMueble.descripcion}</p>
                  </div>
                )}

                <div className="bg-stone-800/30 rounded-xl p-3 border border-stone-700/30">
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="text-stone-500">Creado</p>
                      <p className="text-stone-300">
                        {new Date(selectedMueble.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-stone-500">Actualizado</p>
                      <p className="text-stone-300">
                        {new Date(selectedMueble.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={(e) => handleEdit(selectedMueble, e)}
                    className="flex-1 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    {deleting ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>

                <button
                  onClick={() => setSelectedMueble(null)}
                  className="w-full mt-2 py-3 bg-stone-700 text-stone-200 font-medium rounded-xl hover:bg-stone-600 transition-all"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </PanelHeader>
  );
}
