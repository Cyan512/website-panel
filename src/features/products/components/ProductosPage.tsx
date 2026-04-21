import { useState } from "react";
import { authClient } from "@/shared/lib/auth";
import { PanelHeader, Button, EmptyState, Loading, Modal, InputField } from "@/components";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import { cn } from "@/shared/utils/cn";
import { MdShoppingCart, MdEdit, MdDelete, MdSearch, MdAdd } from "react-icons/md";
import { useProductos } from "../hooks/useProductos";
import type { Producto, CreateProducto, UpdateProducto } from "../types";

type ModalMode = "create" | "edit";

interface ProductoFormState {
  codigo: string;
  nombre: string;
  descripcion: string;
  precio_unitario: string;
  stock: string;
}

const emptyForm: ProductoFormState = {
  codigo: "",
  nombre: "",
  descripcion: "",
  precio_unitario: "",
  stock: "0",
};

function productToForm(p: Producto): ProductoFormState {
  return {
    codigo: p.codigo,
    nombre: p.nombre,
    descripcion: p.descripcion ?? "",
    precio_unitario: String(p.precio_unitario),
    stock: String(p.stock),
  };
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
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [form, setForm] = useState<ProductoFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!session) return <Loading text="Verificando sesión..." />;
  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loading text="Cargando productos..." /></div>;
  if (error) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-danger">{error}</div></div>;

  const openCreate = () => {
    setModalMode("create");
    setEditingProducto(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (p: Producto) => {
    setModalMode("edit");
    setEditingProducto(p);
    setForm(productToForm(p));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProducto(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.codigo.trim() || !form.nombre.trim() || !form.precio_unitario) {
      sileo.warning({ title: "Campos requeridos", description: "Código, nombre y precio son obligatorios" });
      return;
    }
    setSaving(true);
    try {
      if (modalMode === "create") {
        const payload: CreateProducto = {
          codigo: form.codigo.trim(),
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim() || undefined,
          precio_unitario: parseFloat(form.precio_unitario),
          stock: form.stock ? parseInt(form.stock, 10) : 0,
        };
        await createProducto(payload);
        sileo.success({ title: "Producto creado" });
      } else if (editingProducto) {
        const payload: UpdateProducto = {
          codigo: form.codigo.trim(),
          nombre: form.nombre.trim(),
          descripcion: form.descripcion.trim() || undefined,
          precio_unitario: parseFloat(form.precio_unitario),
          stock: form.stock ? parseInt(form.stock, 10) : 0,
        };
        await updateProducto(editingProducto.id, payload);
        sileo.success({ title: "Producto actualizado" });
      }
      closeModal();
    } catch (err) {
      if (!isHandledError(err)) sileo.error({ title: "Error", description: "No se pudo guardar el producto" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: Producto) => {
    const confirmed = window.confirm(`¿Eliminar el producto "${p.nombre}"?`);
    if (!confirmed) return;
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

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | "...")[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

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
            {/* Toolbar */}
            <div className="px-4 sm:px-6 py-3 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); goToPage(1); }}
                  placeholder="Buscar por nombre, código..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-text-muted hidden sm:block">Mostrar</span>
                <select
                  value={limit}
                  onChange={(e) => changeLimit(Number(e.target.value))}
                  className="text-sm rounded-xl border border-border bg-bg-card text-text-primary px-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {[5, 10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <span className="text-xs text-text-muted hidden sm:block">filas</span>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto px-4 sm:px-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Código</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Nombre</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide hidden md:table-cell">Descripción</th>
                    <th className="text-right py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Precio</th>
                    <th className="text-right py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Stock</th>
                    <th className="py-3 px-2 text-right text-xs font-semibold text-text-muted uppercase tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-text-muted">Sin resultados</td>
                    </tr>
                  ) : (
                    filtered.map((p) => (
                      <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-accent-primary/5 transition-colors">
                        <td className="py-3 px-2 text-xs font-mono text-text-muted">{p.codigo}</td>
                        <td className="py-3 px-2 font-medium text-text-primary">{p.nombre}</td>
                        <td className="py-3 px-2 text-text-muted text-xs hidden md:table-cell max-w-xs truncate">
                          {p.descripcion ?? "—"}
                        </td>
                        <td className="py-3 px-2 text-right font-semibold text-text-primary">
                          {p.precio_unitario.toFixed(2)}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <span className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full",
                            p.stock > 10 ? "bg-success-bg text-success" :
                            p.stock > 0 ? "bg-warning-bg text-warning" :
                            "bg-danger-bg text-danger"
                          )}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-end gap-1">
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => openEdit(p)}
                                  title="Editar"
                                  className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all"
                                >
                                  <MdEdit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(p)}
                                  disabled={deleting}
                                  title="Eliminar"
                                  className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all disabled:opacity-40"
                                >
                                  <MdDelete className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-xs text-text-muted px-4 sm:px-6 py-4 border-t border-border/50">
              <span>
                {total === 0
                  ? "Sin resultados"
                  : `${from}–${to} de ${total} producto${total !== 1 ? "s" : ""}`}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => goToPage(1)}
                  disabled={page === 1}
                  className={cn("px-2 py-1.5 rounded-lg border transition-all", page === 1 ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}
                >«</button>
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className={cn("px-3 py-1.5 rounded-lg border transition-all", page === 1 ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}
                >Anterior</button>
                {pageNumbers.map((p, i) =>
                  p === "..." ? (
                    <span key={`e-${i}`} className="px-1">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => goToPage(p as number)}
                      className={cn("w-8 h-8 rounded-lg border text-xs transition-all", p === page ? "bg-primary text-white border-primary" : "border-border hover:border-primary/50 hover:text-primary")}
                    >{p}</button>
                  )
                )}
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={!hasNextPage}
                  className={cn("px-3 py-1.5 rounded-lg border transition-all", !hasNextPage ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}
                >Siguiente</button>
                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={page === totalPages}
                  className={cn("px-2 py-1.5 rounded-lg border transition-all", page === totalPages ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}
                >»</button>
              </div>
            </div>
          </>
        )}
      </PanelHeader>

      {/* Create / Edit Modal */}
      {isAdmin && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={modalMode === "create" ? "Nuevo Producto" : "Editar Producto"}
        >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Código *"
              value={form.codigo}
              onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
              placeholder="PROD-001"
              required
            />
            <InputField
              label="Nombre *"
              value={form.nombre}
              onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
              placeholder="Nombre del producto"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Descripción</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
              placeholder="Descripción opcional..."
              rows={3}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Precio Unitario *"
              type="number"
              min="0"
              step="0.01"
              value={form.precio_unitario}
              onChange={(e) => setForm((f) => ({ ...f, precio_unitario: e.target.value }))}
              placeholder="0.00"
              required
            />
            <InputField
              label="Stock"
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              placeholder="0"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeModal} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? "Guardando..." : modalMode === "create" ? "Crear Producto" : "Guardar Cambios"}
            </Button>
          </div>
        </form>
        </Modal>
      )}
    </>
  );
}
