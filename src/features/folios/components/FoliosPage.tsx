import { useState, useRef, useEffect } from "react";
import { authClient } from "@/shared/lib/auth";
import { PanelHeader, Button, EmptyState, Loading, Modal } from "@/components";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import { cn } from "@/shared/utils/cn";
import { MdReceipt, MdEdit, MdDelete, MdSearch, MdAdd, MdClose, MdShoppingCart, MdRoomService } from "react-icons/md";
import { useFolios } from "../hooks/useFolios";
import type { Folio, CreateFolio, UpdateFolio } from "../types";
import type { Estancia } from "@/features/stays/types";
import { estadoEstadiaColors } from "@/features/stays/types";
import type { Promocion } from "@/features/promotions/types";
import type { Producto } from "@/features/products/types";
import { formatUTCDate } from "@/shared/utils/format";

type ModalMode = "create" | "edit";

interface FolioFormState {
  estancia_id: string;
  observacion: string;
  promocion_ids: string[];
}

const emptyForm: FolioFormState = { estancia_id: "", observacion: "", promocion_ids: [] };

function folioToForm(f: Folio): FolioFormState {
  return {
    estancia_id: f.estanciaId,
    observacion: f.observacion ?? "",
    promocion_ids: f.promociones.map((p) => p.id),
  };
}

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
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [editingFolio, setEditingFolio] = useState<Folio | null>(null);
  const [form, setForm] = useState<FolioFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Estancia search
  const [estanciaQuery, setEstanciaQuery] = useState("");
  const [estanciaSuggestions, setEstanciaSuggestions] = useState<Estancia[]>([]);
  const [estanciaSelected, setEstanciaSelected] = useState<Estancia | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingEstancia, setSearchingEstancia] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Estancia name cache for table display
  const [estanciaMap, setEstanciaMap] = useState<Map<string, string>>(new Map());

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

  // Load estancias + promociones once
  useEffect(() => {
    if (!session) return;
    import("@/features/stays/api").then(({ estanciasApi }) =>
      estanciasApi.getAll().then((data) => {
        const map = new Map<string, string>();
        data.forEach((e) => map.set(e.id, `${e.huesped.nombres} ${e.huesped.apellidos}`));
        setEstanciaMap(map);
      }).catch(() => {})
    );
    import("@/features/promotions/api").then(({ promocionesApi }) =>
      promocionesApi.getAll().then(setPromociones).catch(() => {})
    );
  }, [session]);

  if (!session) return <Loading text="Verificando sesión..." />;
  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loading text="Cargando folios..." /></div>;
  if (error) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-danger">{error}</div></div>;

  const { total, totalPages, hasNextPage } = pagination;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const openCreate = () => {
    setModalMode("create");
    setEditingFolio(null);
    setForm(emptyForm);
    setEstanciaQuery("");
    setEstanciaSuggestions([]);
    setEstanciaSelected(null);
    setIsModalOpen(true);
  };
  const openEdit = (f: Folio) => {
    setModalMode("edit");
    setEditingFolio(f);
    setForm(folioToForm(f));
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFolio(null);
    setForm(emptyForm);
    setEstanciaQuery("");
    setEstanciaSuggestions([]);
    setEstanciaSelected(null);
  };

  const handleEstanciaQuery = (q: string) => {
    setEstanciaQuery(q);
    setEstanciaSelected(null);
    setForm((f) => ({ ...f, estancia_id: "" }));
    setShowSuggestions(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) { setEstanciaSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearchingEstancia(true);
      try {
        const { estanciasApi } = await import("@/features/stays/api");
        const data = await estanciasApi.getAll();
        const q2 = q.toLowerCase();
        setEstanciaSuggestions(
          data.filter((e) =>
            e.huesped.nombres.toLowerCase().includes(q2) ||
            e.huesped.apellidos.toLowerCase().includes(q2) ||
            e.habitacion.nro_habitacion.toLowerCase().includes(q2) ||
            e.id.toLowerCase().includes(q2)
          ).slice(0, 8)
        );
      } catch {
        setEstanciaSuggestions([]);
      } finally {
        setSearchingEstancia(false);
      }
    }, 300);
  };

  const handleSelectEstancia = (e: Estancia) => {
    setEstanciaSelected(e);
    setEstanciaQuery(`${e.huesped.nombres} ${e.huesped.apellidos} — Hab. ${e.habitacion.nro_habitacion}`);
    setForm((f) => ({ ...f, estancia_id: e.id }));
    setShowSuggestions(false);
    setEstanciaSuggestions([]);
  };

  const togglePromocion = (id: string) => {
    setForm((f) => ({
      ...f,
      promocion_ids: f.promocion_ids.includes(id)
        ? f.promocion_ids.filter((p) => p !== id)
        : [...f.promocion_ids, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.estancia_id.trim()) {
      sileo.warning({ title: "Campo requerido", description: "El ID de estancia es obligatorio" });
      return;
    }
    setSaving(true);
    try {
      if (modalMode === "create") {
        const payload: CreateFolio = {
          estancia_id: form.estancia_id.trim(),
          observacion: form.observacion.trim() || undefined,
          promocion_ids: form.promocion_ids.length > 0 ? form.promocion_ids : undefined,
        };
        await createFolio(payload);
      } else if (editingFolio) {
        const payload: UpdateFolio = {
          observacion: form.observacion.trim() || undefined,
          promocion_ids: form.promocion_ids,
        };
        await updateFolio(editingFolio.id, payload);
      }
      closeModal();
    } catch (err) {
      if (!isHandledError(err)) sileo.error({ title: "Error", description: "No se pudo guardar el folio" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (f: Folio) => {
    if (!window.confirm(`¿Eliminar el folio "${f.codigo}"?`)) return;
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
    if (!q.trim()) { setProductoSuggestions([]); return; }
    try {
      const { productosApi } = await import("@/features/products/api");
      const data = await productosApi.getAll(1, 20);
      const q2 = q.toLowerCase();
      setProductoSuggestions(
        data.list.filter((p) =>
          p.nombre.toLowerCase().includes(q2) ||
          p.codigo.toLowerCase().includes(q2)
        )
      );
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

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | "...")[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  const labelClass = "block text-sm font-medium text-text-primary mb-1";

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
            action={<Button onClick={openCreate }>Nuevo Folio</Button>}
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
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por código u observación..."
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <select
                value={estadoFilter === undefined ? "" : String(estadoFilter)}
                onChange={(e) => { const v = e.target.value; changeEstado(v === "" ? undefined : v === "true"); }}
                className="text-sm rounded-xl border border-border bg-bg-card text-text-primary px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 shrink-0"
              >
                <option value="">Todos los estados</option>
                <option value="true">Abiertos</option>
                <option value="false">Cerrados</option>
              </select>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-text-muted hidden sm:block">Mostrar</span>
                <select value={limit} onChange={(e) => changeLimit(Number(e.target.value))}
                  className="text-sm rounded-xl border border-border bg-bg-card text-text-primary px-2 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
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
                    <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Huésped</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide">Estado</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide hidden md:table-cell">Observación</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide hidden lg:table-cell">Cerrado en</th>
                    <th className="text-center py-3 px-2 text-xs font-semibold text-text-muted uppercase tracking-wide hidden sm:table-cell">Promociones</th>
                    <th className="py-3 px-2 text-right text-xs font-semibold text-text-muted uppercase tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-10 text-text-muted">Sin resultados</td></tr>
                  ) : filtered.map((f) => (
                    <tr key={f.id} className="border-b border-border/50 last:border-0 hover:bg-accent-primary/5 transition-colors">
                      <td className="py-3 px-2 text-xs font-mono text-text-primary font-medium">{f.codigo}</td>
                      <td className="py-3 px-2 text-sm text-text-primary font-medium">
                        {estanciaMap.get(f.estanciaId) ?? (
                          <span className="text-xs text-text-muted font-mono" title={f.estanciaId}>
                            {f.estanciaId.slice(0, 8)}…
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
                          f.estado ? "bg-success-bg text-success" : "bg-bg-tertiary text-text-muted"
                        )}>
                          {f.estado ? "Abierto" : "Cerrado"}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-text-muted text-xs hidden md:table-cell max-w-xs truncate">
                        {f.observacion ?? "—"}
                      </td>
                      <td className="py-3 px-2 text-text-muted text-xs hidden lg:table-cell">
                        {f.cerradoEn ? formatUTCDate(f.cerradoEn) : "—"}
                      </td>
                      <td className="py-3 px-2 text-center hidden sm:table-cell">
                        <span className="text-xs font-medium text-text-muted">{f.promociones.length}</span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-end gap-1">
                          {f.estado && (
                            <>
                              <button onClick={() => openAddProduct(f)} title="Agregar producto"
                                className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all">
                                <MdShoppingCart className="w-4 h-4" />
                              </button>
                              <button onClick={() => openAddService(f)} title="Agregar servicio"
                                className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all">
                                <MdRoomService className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button onClick={() => openEdit(f)} title="Editar"
                            className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all">
                            <MdEdit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(f)} disabled={deleting} title="Eliminar"
                            className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all disabled:opacity-40">
                            <MdDelete className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-xs text-text-muted px-4 sm:px-6 py-4 border-t border-border/50">
              <span>{total === 0 ? "Sin resultados" : `${from}–${to} de ${total} folio${total !== 1 ? "s" : ""}`}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => goToPage(1)} disabled={page === 1} className={cn("px-2 py-1.5 rounded-lg border transition-all", page === 1 ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}>«</button>
                <button onClick={() => goToPage(page - 1)} disabled={page === 1} className={cn("px-3 py-1.5 rounded-lg border transition-all", page === 1 ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}>Anterior</button>
                {pageNumbers.map((p, i) =>
                  p === "..." ? <span key={`e-${i}`} className="px-1">…</span> : (
                    <button key={p} onClick={() => goToPage(p as number)}
                      className={cn("w-8 h-8 rounded-lg border text-xs transition-all", p === page ? "bg-primary text-white border-primary" : "border-border hover:border-primary/50 hover:text-primary")}>{p}</button>
                  )
                )}
                <button onClick={() => goToPage(page + 1)} disabled={!hasNextPage} className={cn("px-3 py-1.5 rounded-lg border transition-all", !hasNextPage ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}>Siguiente</button>
                <button onClick={() => goToPage(totalPages)} disabled={page === totalPages} className={cn("px-2 py-1.5 rounded-lg border transition-all", page === totalPages ? "border-border text-text-muted/30 cursor-not-allowed" : "border-border hover:border-primary/50 hover:text-primary")}>»</button>
              </div>
            </div>
          </>
        )}
      </PanelHeader>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={modalMode === "create" ? "Nuevo Folio" : "Editar Folio"} size="lg">
        <div className="max-h-[70vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Estancia field */}
          {modalMode === "create" ? (
            <div className="relative">
              <label className={labelClass}>Estancia *</label>
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={estanciaQuery}
                  onChange={(e) => handleEstanciaQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="Buscar por huésped o habitación..."
                  className={cn(
                    "w-full pl-9 pr-4 py-3 text-sm rounded-xl border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30",
                    estanciaSelected ? "border-emerald-500/50 bg-success/5" : "border-border"
                  )}
                  required
                />
              </div>
              {showSuggestions && (searchingEstancia || estanciaSuggestions.length > 0) && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                  {searchingEstancia ? (
                    <div className="px-4 py-3 text-sm text-text-muted">Buscando...</div>
                  ) : estanciaSuggestions.map((e) => (
                    <button key={e.id} type="button" onMouseDown={() => handleSelectEstancia(e)}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-bg-hover transition-colors text-left border-b border-border/50 last:border-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-text-primary">{e.huesped.nombres} {e.huesped.apellidos}</span>
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-medium", estadoEstadiaColors[e.estado])}>{e.estado}</span>
                        </div>
                        <p className="text-xs text-text-muted mt-0.5">
                          Hab. {e.habitacion.nro_habitacion} · Piso {e.habitacion.piso}
                          {e.fecha_entrada && ` · Entrada: ${formatUTCDate(e.fecha_entrada)}`}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {estanciaSelected && (
                <div className="mt-2 bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 text-xs grid grid-cols-2 gap-x-4 gap-y-1">
                  <span className="text-text-muted">Huésped</span>
                  <span className="text-text-primary font-medium">{estanciaSelected.huesped.nombres} {estanciaSelected.huesped.apellidos}</span>
                  <span className="text-text-muted">Habitación</span>
                  <span className="text-text-primary font-medium">Nro. {estanciaSelected.habitacion.nro_habitacion}</span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className={labelClass}>Huésped</label>
              <input
                value={estanciaMap.get(editingFolio?.estanciaId ?? "") ?? editingFolio?.estanciaId ?? ""}
                disabled
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-bg-card/50 text-text-muted cursor-not-allowed"
              />
            </div>
          )}

          {/* Observación */}
          <div>
            <label className={labelClass}>Observación</label>
            <textarea
              value={form.observacion}
              onChange={(e) => setForm((f) => ({ ...f, observacion: e.target.value }))}
              placeholder="Observación opcional..."
              rows={2}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {/* Promociones picker */}
          <div>
            <label className={labelClass}>
              Promociones
              <span className="text-text-muted font-normal ml-1">(opcional)</span>
            </label>

            {/* Selected chips */}
            {form.promocion_ids.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {form.promocion_ids.map((id) => {
                  const promo = promociones.find((p) => p.id === id);
                  return (
                    <span key={id} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {promo?.codigo ?? id.slice(0, 8)}
                      <button type="button" onClick={() => togglePromocion(id)} className="hover:text-danger transition-colors">
                        <MdClose className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Promo grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1 rounded-xl border border-border bg-bg-card">
              {promociones.length === 0 ? (
                <p className="col-span-3 text-xs text-text-muted text-center py-3">Sin promociones disponibles</p>
              ) : promociones.map((p) => {
                const selected = form.promocion_ids.includes(p.id);
                return (
                  <button key={p.id} type="button" onClick={() => togglePromocion(p.id)}
                    className={cn(
                      "rounded-lg px-2 py-2 text-xs font-medium transition-all text-left",
                      selected ? "bg-primary text-white" : "border border-border text-text-muted hover:border-primary/50 hover:text-primary"
                    )}>
                    <span className="block font-semibold truncate">{p.codigo}</span>
                    <span className="block text-[10px] opacity-70">
                      {p.tipo_descuento === "PORCENTAJE" ? `${p.valor_descuento}%` : `S/ ${p.valor_descuento}`}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-text-muted mt-1">
              {form.promocion_ids.length === 0
                ? "Ninguna seleccionada"
                : `${form.promocion_ids.length} promoción${form.promocion_ids.length !== 1 ? "es" : ""} seleccionada${form.promocion_ids.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeModal} className="flex-1">Cancelar</Button>
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? "Guardando..." : modalMode === "create" ? "Crear Folio" : "Guardar Cambios"}
            </Button>
          </div>
        </form>
        </div>
      </Modal>

      {/* Add Product Modal */}
      <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title="Agregar Producto al Folio" size="md">
        <div className="space-y-4">
          {selectedFolioForProduct && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 text-xs">
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
                onFocus={() => productoSuggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Buscar por nombre o código..."
                className={cn(
                  "w-full pl-9 pr-4 py-3 text-sm rounded-xl border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30",
                  productoSelected ? "border-emerald-500/50 bg-success/5" : "border-border"
                )}
              />
            </div>
            {productoSuggestions.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                {productoSuggestions.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setProductoSelected(p); setProductoQuery(p.nombre); setProductoSuggestions([]); }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-bg-hover transition-colors text-left border-b border-border/50 last:border-0"
                  >
                    <div>
                      <span className="text-sm font-medium text-text-primary">{p.nombre}</span>
                      <span className="text-xs text-text-muted ml-2">{p.codigo}</span>
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
              <span className="text-text-primary font-bold text-primary">S/ {(Number(productoSelected.precio_unitario) * cantidad).toFixed(2)}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsProductModalOpen(false)} className="flex-1">Cancelar</Button>
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
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 text-xs">
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
              <span className="text-text-primary font-bold text-primary">S/ {(parseFloat(servicioPrecio.replace(",", ".") || "0") * servicioCantidad).toFixed(2)}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsServiceModalOpen(false)} className="flex-1">Cancelar</Button>
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
    </>
  );
}
