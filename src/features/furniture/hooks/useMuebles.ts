import { useState, useEffect, useCallback, useRef } from "react";
import { authClient } from "@/shared/lib/auth";
import { mueblesApi, categoriasApi } from "../api";
import type { Mueble, CreateMueble, UpdateMueble, PaginationMeta, MuebleCondition } from "../types";
import type { CategoriaMueble } from "@/features/furniture-categories/types";

interface Filters {
  nombre?: string;
  categoria?: string;
  condicion?: MuebleCondition;
}

export function useMuebles(initialPage = 1, initialLimit = 12) {
  const { data: session } = authClient.useSession();
  const [muebles, setMuebles] = useState<Mueble[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [categorias, setCategorias] = useState<CategoriaMueble[]>([]);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [filters, setFilters] = useState<Filters>({});
  const [searchInput, setSearchInput] = useState(""); // Estado local para el input
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs para control de búsqueda
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchMuebles = useCallback(
    async (p = page, l = limit, f = filters, signal?: AbortSignal) => {
      try {
        setLoading(true);
        setError(null);
        const [data, categoriasData] = await Promise.all([
          mueblesApi.getPage(p, l, f.nombre, f.categoria, f.condicion, signal),
          categoriasApi.getAll(),
        ]);
        setMuebles(data.list);
        setPagination(data.pagination);
        setCategorias(categoriasData);
      } catch (err: any) {
        // Ignorar errores de cancelación
        if (err.name !== "AbortError" && err.name !== "CanceledError") {
          setError("Error al cargar muebles");
        }
      } finally {
        setLoading(false);
        setSearching(false);
      }
    },
    [page, limit, filters],
  );

  useEffect(() => {
    if (session) {
      // Cancelar request anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Crear nuevo AbortController
      abortControllerRef.current = new AbortController();

      fetchMuebles(page, limit, filters, abortControllerRef.current.signal);
    }

    // Cleanup: cancelar request al desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [session, page, limit, filters]);

  const goToPage = (p: number) => setPage(p);
  const changeLimit = (l: number) => {
    setLimit(l);
    setPage(1);
  };

  // Búsqueda mejorada con debounce, mínimo de caracteres y cancelación
  const changeSearch = (q: string) => {
    // Actualizar el input inmediatamente para que sea responsive
    setSearchInput(q);

    // Limpiar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Si el campo está vacío, buscar inmediatamente
    if (!q || q.trim() === "") {
      setSearching(false);
      setFilters((prev) => ({ ...prev, nombre: undefined }));
      setPage(1);
      return;
    }

    // Mostrar indicador de búsqueda
    setSearching(true);

    // Aplicar debounce de 500ms
    debounceTimerRef.current = setTimeout(() => {
      // Solo buscar si tiene al menos 2 caracteres
      if (q.trim().length >= 2) {
        setFilters((prev) => ({ ...prev, nombre: q.trim() }));
        setPage(1);
      } else {
        setSearching(false);
      }
    }, 500);
  };

  // Filtros de categoría y condición (selección única)
  const changeCategoria = (catId: string | null) => {
    setFilters((prev) => ({ ...prev, categoria: catId || undefined }));
    setPage(1);
  };

  const changeCondicion = (cond: MuebleCondition | null) => {
    setFilters((prev) => ({ ...prev, condicion: cond || undefined }));
    setPage(1);
  };

  const clearFilters = () => {
    // Limpiar también el input de búsqueda
    setSearchInput("");
    setSearching(false);
    setFilters({});
    setPage(1);
  };

  const createMueble = async (data: CreateMueble): Promise<Mueble> => {
    const mueble = await mueblesApi.create(data);
    await fetchMuebles(page, limit, filters);
    return mueble;
  };

  const updateMueble = async (id: string, data: UpdateMueble): Promise<Mueble> => {
    const mueble = await mueblesApi.update(id, data);
    setMuebles((prev) => prev.map((m) => (m.id === id ? mueble : m)));
    return mueble;
  };

  const deleteMueble = async (id: string): Promise<void> => {
    await mueblesApi.delete(id);
    const newTotal = pagination.total - 1;
    const newTotalPages = Math.max(1, Math.ceil(newTotal / limit));
    const targetPage = page > newTotalPages ? newTotalPages : page;
    await fetchMuebles(targetPage, limit, filters);
    if (targetPage !== page) setPage(targetPage);
  };

  return {
    muebles,
    pagination,
    categorias,
    page,
    limit,
    filters,
    searchInput,
    loading,
    searching,
    error,
    fetchMuebles: () => fetchMuebles(page, limit, filters),
    goToPage,
    changeLimit,
    changeSearch,
    changeCategoria,
    changeCondicion,
    clearFilters,
    createMueble,
    updateMueble,
    deleteMueble,
  };
}
