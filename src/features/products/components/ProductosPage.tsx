import { useState } from "react";
import { authClient } from "@/shared/lib/auth";
import { PanelHeader, Button, EmptyState, Loading, ConfirmDialog, Pagination } from "@/components";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import { MdShoppingCart, MdAdd, MdSearch } from "react-icons/md";
import { useProductos } from "../hooks/useProductos";
import { ProductosTable } from "./ProductosTable";
import { ProductosModal } from "./ProductosModal";
import type { Producto, CreateProducto, UpdateProducto } from "../types";

interface ProductoFormState {
  codigo: string;
  nombre: string;
  descripcion: string;
  precio_unitario: string;
  stock: string;
}

export default function ProductosPage() {
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const {
    filtered,
    pagination,
    page,
    limit,
    search,
    setSearch,
    loading,
    error,
    goToPage,
    changeLimit,
    createProducto,
    updateProducto,
    deleteProducto,
  } = useProductos();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Producto | null>(null);

  if (!session) return <Loading text="Verificando sesión..." />;
  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loading text="Cargando productos..." /></div>;
  if (error) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-danger">{error}</div></div>;

  const openCreate = () => {
    setEditingProducto(null);
    setIsModalOpen(true);
  };

  const openEdit = (p: Producto) => {
    setEditingProducto(p);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProducto(null);
  };

  const handleSubmit = async (form: ProductoFormState) => {
    if (!form.codigo.trim() || !form.nombre.trim() || !form.precio_unitario) {
      sileo.warning({ title: "Campos requeridos", description: "Código, nombre y precio son obligatorios" });
      return;
    }
    setSaving(true);
    try {
      if (editingProducto) {
        const payload: UpdateProducto = {
          codigo: form.codigo.trim(),
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim() || undefined,
          precio_unitario: parseFloat(form.precio_unitario),
          stock: form.stock ? parseInt(form.stock, 10) : 0,
        };
        await updateProducto(editingProducto.id, payload);
        sileo.success({ title: "Producto actualizado" });
      } else {
        const payload: CreateProducto = {
          codigo: form.codigo.trim(),
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim() || undefined,
          precio_unitario: parseFloat(form.precio_unitario),
          stock: form.stock ? parseInt(form.stock, 10) : 0,
        };
        await createProducto(payload);
        sileo.success({ title: "Producto creado" });
      }
      closeModal();
    } catch (err) {
      if (!isHandledError(err)) sileo.error({ title: "Error", description: "No se pudo guardar el producto" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: Producto) => {
    setDeleting(true);
    try {
      await deleteProducto(p.id);
      sileo.success({ title: "Producto eliminado" });
    } catch (err) {
      if (!isHandledError(err)) sileo.error({ title: "Error", description: "No se pudo eliminar el producto" });
    } finally {
      setDeleting(false);
    }
  };

  const { total, totalPages, hasNextPage } = pagination;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <>
      <PanelHeader
        title="Productos"
        subtitle="Gestión de productos y stock"
        action={isAdmin ? (
          <Button onClick={openCreate}>
            <MdAdd className="w-4 h-4 mr-1" />
            Nuevo Producto
          </Button>
        ) : undefined}
      >
        {total === 0 && !search ? (
          <EmptyState
            icon={<MdShoppingCart className="w-10 h-10 text-text-muted/50" />}
            title="Sin productos"
            description="Registra tu primer producto"
            action={isAdmin ? <Button onClick={openCreate}>Nuevo Producto</Button> : undefined}
          />
        ) : (
          <>
            {/* Search and Filter Row */}
            <div className="flex gap-2 items-center mb-4">
              <div className="relative flex-1 max-w-xs">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); goToPage(1); }}
                  placeholder="Buscar..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* Table container with flex-1 to fill available space */}
            <div className="flex flex-col flex-1 min-h-0">
              <div className="overflow-hidden px-4 sm:px-6 flex-1">
                <ProductosTable
                  productos={filtered}
                  isAdmin={isAdmin}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                  deleting={deleting}
                />
              </div>

              {/* Pagination */}
              <Pagination
                page={page}
                totalPages={totalPages}
                pageSizeValue={limit}
                onPageSizeChange={(v: number) => changeLimit(v)}
                pageSizeOptions={[5, 10, 25, 50, 100]}
                hasNextPage={hasNextPage}
                onPageChange={goToPage}
                label={total === 0 ? "Sin resultados" : `${from}–${to} de ${total} producto${total !== 1 ? "s" : ""}`}
              />
            </div>
          </>
        )}
      </PanelHeader>

      {/* Create / Edit Modal */}
      {isAdmin && (
        <ProductosModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleSubmit}
          editingProducto={editingProducto}
          saving={saving}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar producto"
        description={deleteTarget ? `¿Eliminar el producto "${deleteTarget.nombre}"?` : undefined}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
        isConfirmLoading={deleting}
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
