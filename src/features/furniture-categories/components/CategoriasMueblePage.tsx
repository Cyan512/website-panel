import { useState } from "react";
import { PanelHeader, Button, EmptyState, Loading, CrudToolbar, Pagination, ConfirmDialog } from "@/components";
import { useCategoriasMueble } from "../hooks/useCategoriasMueble";
import { CategoriaMuebleModal } from "./CategoriaMuebleModal";
import type { CategoriaMueble, CreateCategoriaMueble } from "../types";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import { MdCategory } from "react-icons/md";

export default function CategoriasMueblePage() {
  const { categorias, loading, error, fetchCategorias, createCategoria, updateCategoria, deleteCategoria } = useCategoriasMueble();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaMueble | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoriaMueble | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading text="Cargando categorías..." />
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-danger">{error}</div>
      </div>
    );

  const handleSave = async (data: CreateCategoriaMueble) => {
    if (editingCategoria) return updateCategoria(editingCategoria.id, data);
    return createCategoria(data);
  };

  const handleDelete = async (cat: CategoriaMueble) => {
    setDeleting(cat.id);
    try {
      await deleteCategoria(cat.id);
    } catch (err) {
      if (!isHandledError(err)) {
        sileo.error({ title: "Error", description: "No se pudo eliminar la categoría" });
      }
    } finally {
      setDeleting(null);
    }
  };

  const openCreate = () => {
    setEditingCategoria(null);
    setIsModalOpen(true);
  };
  const openEdit = (cat: CategoriaMueble) => {
    setEditingCategoria(cat);
    setIsModalOpen(true);
  };

  const filtered = categorias.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.nombre.toLowerCase().includes(q);
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const from = filtered.length === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, filtered.length);

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
            action={<Button onClick={openCreate}>Nueva Categoría</Button>}
          />
        ) : (
          <>
            <div className="p-4 sm:p-6">
              <div className="bg-linear-to-br from-accent-primary/10 to-accent-light/10 rounded-2xl p-5 border border-accent-primary/20 mb-4">
                <p className="text-text-muted text-sm">Total</p>
                <p className="text-2xl font-bold font-display mt-1">{categorias.length}</p>
              </div>
            </div>

            <CrudToolbar
              searchValue={search}
              onSearchChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              searchPlaceholder="Buscar por nombre..."
              pageSizeValue={perPage}
              onPageSizeChange={(v) => {
                setPerPage(v);
                setPage(1);
              }}
              pageSizeOptions={[5, 10, 25, 50]}
            />

            <div className="px-4 sm:px-6 pb-2">
              <table className="w-full text-base">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-text-muted font-semibold text-sm uppercase tracking-wide">Nombre</th>
                    <th className="py-3 px-2 text-right text-text-muted font-semibold text-sm uppercase tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="text-center py-10 text-text-muted">
                        Sin resultados
                      </td>
                    </tr>
                  ) : (
                    paginated.map((cat) => (
                      <tr key={cat.id} className="border-b border-border/50 last:border-0 hover:bg-accent-primary/5 transition-colors">
                        <td className="py-3 px-2 font-medium text-text-primary">{cat.nombre}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEdit(cat)}
                              className="text-xs px-3 py-1.5 rounded-lg bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 transition-all border border-accent-primary/20"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => setDeleteTarget(cat)}
                              disabled={deleting === cat.id}
                              className="text-xs px-3 py-1.5 rounded-lg bg-danger-bg text-danger hover:bg-danger-bg transition-all border border-danger/20 disabled:opacity-50"
                            >
                              {deleting === cat.id ? "..." : "Eliminar"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              label={filtered.length === 0 ? "Sin resultados" : `${from}–${to} de ${filtered.length} categoría${filtered.length !== 1 ? "s" : ""}`}
            />
          </>
        )}
      </PanelHeader>

      <CategoriaMuebleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategoria(null);
        }}
        onSuccess={fetchCategorias}
        categoria={editingCategoria}
        onSave={handleSave}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar categoría"
        description={deleteTarget ? `¿Eliminar la categoría "${deleteTarget.nombre}"?` : undefined}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
        isConfirmLoading={Boolean(deleting)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const target = deleteTarget;
          setDeleteTarget(null);
          await handleDelete(target);
        }}
      />
    </>
  );
}
