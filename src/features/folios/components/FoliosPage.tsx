import { useState, useEffect } from "react";
import { authClient } from "@/shared/lib/auth";
import { PanelHeader, Button, EmptyState, Loading, Modal, Pagination, ConfirmDialog } from "@/components";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import { cn } from "@/shared/utils/cn";
import { MdReceipt, MdAdd, MdSearch } from "react-icons/md";
import { useFolios } from "../hooks/useFolios";
import { FolioModal } from "./FolioModal";
import { FolioCard } from "./FolioCard";
import type { Folio, CreateFolio, UpdateFolio } from "../types";
import type { Promocion } from "@/features/promotions/types";
import type { Producto } from "@/features/products/types";

export default function FoliosPage() {
  const { data: session } = authClient.useSession();
  const {
    filtered,
    pagination,
    page,
    limit,
    search,
    setSearch,
    estadoFilter,
    loading,
    error,
    goToPage,
    changeLimit,
    changeEstado,
    createFolio,
    updateFolio,
    deleteFolio,
    addProductoToFolio,
    addServicioToFolio,
  } = useFolios();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingFolio, setEditingFolio] = useState<Folio | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Folio | null>(null);

  // Reserva name cache for table display
  const [reservaMap, setReservaMap] = useState<Map<string, string>>(new Map());

  // Promociones list for picker
  const [promociones, setPromociones] = useState<Promocion[]>([]);

  // Add product modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedFolioForProduct, setSelectedFolioForProduct] = useState<Folio | null>(null);
  const [productoQuery, setProductoQuery] = useState("");
  const [productoSuggestions, setProductoSuggestions] = useState<Producto[]>([]);
  const [productoSelected, setProductoSelected] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [addingProduct, setAddingProduct] = useState(false);

  // Add service modal
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedFolioForService, setSelectedFolioForService] = useState<Folio | null>(null);
  const [servicioConcepto, setServicioConcepto] = useState("");
  const [servicioCantidad, setServicioCantidad] = useState(1);
  const [servicioPrecio, setServicioPrecio] = useState("");
  const [addingService, setAddingService] = useState(false);

  // Load promociones once
  useEffect(() => {
    if (!session) return;
    import("@/features/promotions/api").then(({ promocionesApi }) =>
      promocionesApi
        .getAll()
        .then(setPromociones)
        .catch(() => {}),
    );
  }, [session]);

  // Load reservas to populate reserva names
  useEffect(() => {
    if (!session) return;
    import("@/features/reservations/api").then(({ reservasApi }) =>
      reservasApi
        .getAll(1, 100)
        .then((data) => {
          const map = new Map<string, string>();
          data.list.forEach((r) => map.set(r.id, r.nombre_huesped));
          setReservaMap(map);
        })
        .catch(() => {}),
    );
  }, [session]);

  if (!session) return <Loading text="Verificando sesión..." />;
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading text="Cargando folios..." />
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-danger">{error}</div>
      </div>
    );

  const { total, totalPages, hasNextPage } = pagination;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const openCreate = () => {
    setModalMode("create");
    setEditingFolio(null);
    setIsModalOpen(true);
  };

  const openEdit = (f: Folio) => {
    setModalMode("edit");
    setEditingFolio(f);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFolio(null);
  };

  const handleSaveModal = async (data: CreateFolio | UpdateFolio, mode: "create" | "edit", folioId?: string) => {
    try {
      if (mode === "create") {
        await createFolio(data as CreateFolio);
        sileo.success({ title: "Folio creado", description: "El folio ha sido creado exitosamente" });
      } else if (folioId) {
        await updateFolio(folioId, data as UpdateFolio);
        sileo.success({ title: "Folio actualizado", description: "El folio ha sido actualizado exitosamente" });
      }
    } catch (err) {
      if (!isHandledError(err)) sileo.error({ title: "Error", description: "No se pudo guardar el folio" });
      throw err;
    }
  };

  const handleDelete = async (f: Folio) => {
    setDeleting(true);
    try {
      await deleteFolio(f.id);
    } catch (err) {
      if (!isHandledError(err)) sileo.error({ title: "Error", description: "No se pudo eliminar el folio" });
    } finally {
      setDeleting(false);
    }
  };

  const openAddProduct = (f: Folio) => {
    if (!f.estado) {
      sileo.warning({ title: "Folio cerrado", description: "No se puede agregar productos a un folio cerrado" });
      return;
    }
    setSelectedFolioForProduct(f);
    setProductoQuery("");
    setProductoSuggestions([]);
    setProductoSelected(null);
    setCantidad(1);
    setIsProductModalOpen(true);
  };

  const openAddService = (f: Folio) => {
    if (!f.estado) {
      sileo.warning({ title: "Folio cerrado", description: "No se puede agregar servicios a un folio cerrado" });
      return;
    }
    setSelectedFolioForService(f);
    setServicioConcepto("");
    setServicioCantidad(1);
    setServicioPrecio("");
    setIsServiceModalOpen(true);
  };

  const handleProductoQuery = async (q: string) => {
    setProductoQuery(q);
    setProductoSelected(null);
    if (!q.trim()) {
      setProductoSuggestions([]);
      return;
    }
    try {
      const { productosApi } = await import("@/features/products/api");
      const data = await productosApi.getAll(1, 20);
      const q2 = q.toLowerCase();
      setProductoSuggestions(data.list.filter((p) => p.nombre.toLowerCase().includes(q2) || p.codigo.toLowerCase().includes(q2)));
    } catch {
      setProductoSuggestions([]);
    }
  };

  const handleAddProducto = async () => {
    if (!productoSelected || !selectedFolioForProduct) return;
    setAddingProduct(true);
    try {
      await addProductoToFolio(selectedFolioForProduct.id, { producto_id: productoSelected.id, cantidad });
      sileo.success({ title: "Producto agregado", description: `${productoSelected.nombre} x${cantidad} agregado al folio` });
      setIsProductModalOpen(false);
    } catch (err) {
      if (!isHandledError(err)) sileo.error({ title: "Error", description: "No se pudo agregar el producto" });
    } finally {
      setAddingProduct(false);
    }
  };

  const handleAddServicio = async () => {
    if (!servicioConcepto.trim() || !selectedFolioForService) return;
    const precio = parseFloat(servicioPrecio.replace(",", ".")) || 0;
    if (precio <= 0 || servicioCantidad <= 0) {
      sileo.warning({ title: "Datos inválidos", description: "La cantidad y precio deben ser mayores a cero" });
      return;
    }
    setAddingService(true);
    try {
      await addServicioToFolio(selectedFolioForService.id, { concepto: servicioConcepto.trim(), cantidad: servicioCantidad, precio_unit: precio });
      sileo.success({ title: "Servicio agregado", description: `${servicioConcepto} x${servicioCantidad} agregado al folio` });
      setIsServiceModalOpen(false);
    } catch (err) {
      if (!isHandledError(err)) sileo.error({ title: "Error", description: "No se pudo agregar el servicio" });
    } finally {
      setAddingService(false);
    }
  };

  const labelClass = "block font-medium text-text-primary mb-1";

  return (
    <>
      <PanelHeader
        title="Folios"
        subtitle="Gestión de folios de estancia"
        action={
          <Button onClick={openCreate}>
            <MdAdd className="w-4 h-4 mr-1" />
            Nuevo Folio
          </Button>
        }
      >
        {total === 0 && !search && estadoFilter === undefined ? (
          <EmptyState
            icon={<MdReceipt className="w-10 h-10 text-text-muted/50" />}
            title="Sin folios"
            description="Crea el primer folio de estancia"
            action={<Button onClick={openCreate}>Nuevo Folio</Button>}
          />
        ) : (
          <>
            {/* Search and Filter Row */}
            <div className="flex gap-2 items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-xs">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Filter */}
              <select
                value={estadoFilter === undefined ? "" : String(estadoFilter)}
                onChange={(e) => {
                  const v = e.target.value;
                  changeEstado(v === "" ? undefined : v === "true");
                }}
                className="text-sm rounded-lg border border-border bg-bg-card text-text-primary px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Todos los estados</option>
                <option value="true">Abiertos</option>
                <option value="false">Cerrados</option>
              </select>
            </div>

            {/* Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((f) => (
                <FolioCard
                  key={f.id}
                  folio={f}
                  reservaName={reservaMap.get(f.reservaId)}
                  onEdit={(e) => {
                    e.stopPropagation();
                    openEdit(f);
                  }}
                  onDelete={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(f);
                  }}
                  onAddProduct={(e) => {
                    e.stopPropagation();
                    openAddProduct(f);
                  }}
                  onAddService={(e) => {
                    e.stopPropagation();
                    openAddService(f);
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              page={page}
              totalPages={totalPages}
              hasNextPage={hasNextPage}
              onPageChange={goToPage}
              label={total === 0 ? "Sin resultados" : `${from}–${to} de ${total} folio${total !== 1 ? "s" : ""}`}
              pageSizeValue={limit}
              onPageSizeChange={changeLimit}
              pageSizeOptions={[5, 10, 25, 50]}
              className="px-0"
            />
          </>
        )}
      </PanelHeader>

      {/* Folio Modal */}
      <FolioModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={() => {}}
        mode={modalMode}
        folio={editingFolio}
        reservaMap={reservaMap}
        promociones={promociones}
        onSave={handleSaveModal}
      />

      {/* Add Product Modal */}
      <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title="Agregar Producto al Folio" size="md">
        <div className="space-y-4">
          {selectedFolioForProduct && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5">
              <span className="text-text-muted">Folio: </span>
              <span className="text-text-primary font-medium font-mono">{selectedFolioForProduct.codigo}</span>
            </div>
          )}

          <div className="relative">
            <label className={labelClass}>Producto *</label>
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={productoQuery}
                onChange={(e) => handleProductoQuery(e.target.value)}
                placeholder="Buscar por nombre o código..."
                className={cn(
                  "w-full pl-9 pr-4 py-3 rounded-xl border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30",
                  productoSelected ? "border-success/40 bg-success-bg/40" : "border-border",
                )}
              />
            </div>
            {productoSuggestions.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                {productoSuggestions.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setProductoSelected(p);
                      setProductoQuery(p.nombre);
                      setProductoSuggestions([]);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-bg-hover transition-colors text-left border-b border-border/50 last:border-0"
                  >
                    <div>
                      <span className="text-sm font-medium text-text-primary">{p.nombre}</span>
                      <span className="text-text-muted ml-2">{p.codigo}</span>
                    </div>
                    <span className="text-xs font-medium text-primary">S/ {Number(p.precio_unitario).toFixed(2)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>Cantidad *</label>
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-3 text-sm rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {productoSelected && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-xs grid grid-cols-2 gap-x-4 gap-y-1">
              <span className="text-text-muted">Producto</span>
              <span className="text-text-primary font-medium">{productoSelected.nombre}</span>
              <span className="text-text-muted">Precio unitario</span>
              <span className="text-text-primary font-medium">S/ {Number(productoSelected.precio_unitario).toFixed(2)}</span>
              <span className="text-text-muted">Total</span>
              <span className="text-text-primary font-bold">S/ {(Number(productoSelected.precio_unitario) * cantidad).toFixed(2)}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsProductModalOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleAddProducto}
              disabled={!productoSelected || addingProduct}
              isLoading={addingProduct}
              className="flex-1"
            >
              Agregar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Service Modal */}
      <Modal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} title="Agregar Servicio al Folio" size="md">
        <div className="space-y-4">
          {selectedFolioForService && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5">
              <span className="text-text-muted">Folio: </span>
              <span className="text-text-primary font-medium font-mono">{selectedFolioForService.codigo}</span>
            </div>
          )}

          <div>
            <label className={labelClass}>Concepto *</label>
            <input
              type="text"
              value={servicioConcepto}
              onChange={(e) => setServicioConcepto(e.target.value)}
              placeholder="Ej: Masaje spa, Lavandería, Tour..."
              className="w-full px-3 py-3 text-sm rounded-xl border border-border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Cantidad *</label>
              <input
                type="number"
                min="1"
                value={servicioCantidad}
                onChange={(e) => setServicioCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-3 text-sm rounded-xl border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className={labelClass}>Precio Unitario *</label>
              <input
                type="text"
                value={servicioPrecio}
                onChange={(e) => setServicioPrecio(e.target.value.replace(/[^0-9.,]/g, ""))}
                placeholder="0.00"
                className="w-full px-3 py-3 text-sm rounded-xl border border-border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {servicioConcepto && servicioPrecio && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-xs grid grid-cols-2 gap-x-4 gap-y-1">
              <span className="text-text-muted">Servicio</span>
              <span className="text-text-primary font-medium">{servicioConcepto}</span>
              <span className="text-text-muted">Precio unitario</span>
              <span className="text-text-primary font-medium">S/ {parseFloat(servicioPrecio.replace(",", ".") || "0").toFixed(2)}</span>
              <span className="text-text-muted">Total</span>
              <span className="text-text-primary font-bold">
                S/ {(parseFloat(servicioPrecio.replace(",", ".") || "0") * servicioCantidad).toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsServiceModalOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleAddServicio}
              disabled={!servicioConcepto.trim() || !servicioPrecio || addingService}
              isLoading={addingService}
              className="flex-1"
            >
              Agregar
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar folio"
        description={deleteTarget ? `¿Eliminar el folio "${deleteTarget.codigo}"?` : undefined}
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
