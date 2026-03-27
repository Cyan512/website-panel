import { useState } from "react";
import { PanelHeader, Button, EmptyState, Loading } from "@/components";
import { useCategoriasMueble } from "../hooks/useCategoriasMueble";
import { CategoriaMuebleModal } from "./CategoriaMuebleModal";
import { cn } from "@/utils/cn";
import type { CategoriaMuebleOutputDto, CreateCategoriaMuebleDto } from "../types";
import { sileo } from "sileo";
import { MdCategory } from "react-icons/md";

export default function CategoriasMueblePage() {
  const { categorias, loading, error, fetchCategorias, createCategoria, updateCategoria, deleteCategoria } = useCategoriasMueble();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaMuebleOutputDto | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loading text="Cargando categorías..." /></div>;
  if (error) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-danger">{error}</div></div>;

  const handleSave = async (data: CreateCategoriaMuebleDto) => {
    if (editingCategoria) return updateCategoria(editingCategoria.id, data);
    return createCategoria(data);
  };

  const handleDelete = async (cat: CategoriaMuebleOutputDto) => {
    const confirmed = window.confirm(`¿Eliminar la categoría "${cat.nombre}"?`);
    if (!confirmed) return;
    setDeleting(cat.id);
    try {
      await deleteCategoria(cat.id);
    } catch {
      sileo.error({ title: "Error", description: "No se pudo eliminar la categoría" });
    } finally {
      setDeleting(null);
    }
  };

  const openCreate = () => { setEditingCategoria(null); setIsModalOpen(true); };
  const openEdit = (cat: CategoriaMuebleOutputDto) => { setEditingCategoria(cat); setIsModalOpen(true); };

  const activas = categorias.filter((c) => c.activo).length;

  return (
    <>
      <PanelHeader
        title="Categorías de Muebles"
        subtitle="Gestión de categorías para el inventario de mobiliario"
        action={<Button onClick={openCreate}>+ Nueva Categoría</Button>}
      >
        {categorias.length === 0 ? (
          <EmptyState
            icon={<MdCategory className="w-10 h-10 text-text-muted/50" />}
            title="Sin categorías"
            description="Crea la primera categoría de muebles"
            action={{ label: "Nueva Categoría", onClick: openCreate }}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 sm:p-6">
              <div className="bg-gradient-to-br from-accent-primary/10 to-accent-light/10 rounded-2xl p-5 border border-accent-primary/20">
                <p className="text-text-muted text-sm">Total</p>
                <p className="text-2xl font-bold font-playfair mt-1">{categorias.length}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-5 border border-emerald-200/50">
                <p className="text-text-muted text-sm">Activas</p>
                <p className="text-2xl font-bold font-playfair mt-1 text-emerald-700">{activas}</p>
              </div>
              <div className="bg-gradient-to-br from-paper-medium/20 to-paper-medium/10 rounded-2xl p-5 border border-border-light/50">
                <p className="text-text-muted text-sm">Inactivas</p>
                <p className="text-2xl font-bold font-playfair mt-1">{categorias.length - activas}</p>
              </div>
            </div>

            <div className="px-4 sm:px-6 pb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-light/50">
                    <th className="text-left py-3 px-2 text-text-muted font-medium text-xs uppercase tracking-wide">Nombre</th>
                    <th className="text-left py-3 px-2 text-text-muted font-medium text-xs uppercase tracking-wide hidden sm:table-cell">Descripción</th>
                    <th className="text-left py-3 px-2 text-text-muted font-medium text-xs uppercase tracking-wide">Estado</th>
                    <th className="py-3 px-2" />
                  </tr>
                </thead>
                <tbody>
                  {categorias.map((cat) => (
                    <tr key={cat.id} className="border-b border-border-light/30 hover:bg-paper-medium/10 transition-colors">
                      <td className="py-3 px-2 font-medium text-text-primary">{cat.nombre}</td>
                      <td className="py-3 px-2 text-text-muted hidden sm:table-cell">{cat.descripcion ?? "—"}</td>
                      <td className="py-3 px-2">
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", cat.activo ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600")}>
                          {cat.activo ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(cat)} className="text-xs px-3 py-1.5 rounded-lg bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 transition-all border border-accent-primary/20">
                            Editar
                          </button>
                          <button onClick={() => handleDelete(cat)} disabled={deleting === cat.id} className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-danger hover:bg-red-100 transition-all border border-red-200 disabled:opacity-50">
                            {deleting === cat.id ? "..." : "Eliminar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </PanelHeader>

      <CategoriaMuebleModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCategoria(null); }}
        onSuccess={fetchCategorias}
        categoria={editingCategoria}
        onSave={handleSave}
      />
    </>
  );
}
