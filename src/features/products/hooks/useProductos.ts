import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/shared/lib/auth";
import { productosApi } from "../api";
import type { Producto, CreateProducto, UpdateProducto } from "../types";

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function useProductos(initialPage = 1, initialLimit = 10) {
  const { data: session } = authClient.useSession();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: initialPage, limit: initialLimit, total: 0, totalPages: 1,
    hasNextPage: false, hasPreviousPage: false,
  });
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductos = useCallback(async (p = page, l = limit) => {
    try {
      setLoading(true);
      setError(null);
      const data = await productosApi.getAll(p, l);
      setProductos(data.list);
      setPagination(data.pagination);
    } catch {
      setError("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    if (session) fetchProductos(page, limit);
  }, [session, page, limit]);

  const goToPage = (p: number) => setPage(p);
  const changeLimit = (l: number) => { setLimit(l); setPage(1); };

  const createProducto = async (data: CreateProducto): Promise<Producto> => {
    const producto = await productosApi.create(data);
    await fetchProductos(page, limit);
    return producto;
  };

  const updateProducto = async (id: string, data: UpdateProducto): Promise<Producto> => {
    const producto = await productosApi.update(id, data);
    setProductos((prev) => prev.map((p) => (p.id === id ? producto : p)));
    return producto;
  };

  const deleteProducto = async (id: string): Promise<void> => {
    await productosApi.delete(id);
    const newTotal = pagination.total - 1;
    const newTotalPages = Math.max(1, Math.ceil(newTotal / limit));
    const targetPage = page > newTotalPages ? newTotalPages : page;
    await fetchProductos(targetPage, limit);
    if (targetPage !== page) setPage(targetPage);
  };

  // Client-side search on the current page results
  const filtered = search
    ? productos.filter((p) => {
        const q = search.toLowerCase();
        return (
          p.nombre.toLowerCase().includes(q) ||
          p.codigo.toLowerCase().includes(q) ||
          (p.descripcion ?? "").toLowerCase().includes(q)
        );
      })
    : productos;

  return {
    productos,
    filtered,
    pagination,
    page,
    limit,
    search,
    setSearch,
    loading,
    error,
    fetchProductos: () => fetchProductos(page, limit),
    goToPage,
    changeLimit,
    createProducto,
    updateProducto,
    deleteProducto,
  };
}
