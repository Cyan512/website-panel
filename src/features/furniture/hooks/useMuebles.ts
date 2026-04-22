import { useState, useEffect, useCallback, useRef } from "react";
import { authClient } from "@/shared/lib/auth";
import { mueblesApi, categoriasMuebleApi } from "../api";
import type { Mueble, CreateMueble, UpdateMueble, PaginationMeta, MuebleCondition } from "../types";
import type { CategoriaMueble, CreateCategoriaMueble, UpdateCategoriaMueble } from "@/features/furniture-categories/types";

interface Filters {
  codigo?: string;
  categoria?: string;
  condicion?: MuebleCondition;
}

export function useMuebles(initialPage = 1, initialLimit = 10) {
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
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchMuebles = useCallback(
    async (p = page, l = limit, f = filters, signal?: AbortSignal) => {
      try {
        setLoading(true);
        setError(null);
        const data = await mueblesApi.getPage(p, l, f.codigo, f.categoria, f.condicion, signal);
        setMuebles(data.list);
        setPagination(data.pagination);
      } catch (err: any) {
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

  const fetchCategorias = useCallback(async () => {
    try {
      const data = await categoriasMuebleApi.getAll();
      setCategorias(data);
    } catch (err) {
      console.error("Error al cargar categorías", err);
    }
  }, []);

  useEffect(() => {
    if (session) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      fetchMuebles(page, limit, filters, abortControllerRef.current.signal);
      fetchCategorias();
    }

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

  const changeSearch = (q: string) => {
    setSearchInput(q);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!q || q.trim() === "") {
      setSearching(false);
      setFilters((prev) => ({ ...prev, codigo: undefined }));
      setPage(1);
      return;
    }

    setSearching(true);

    debounceTimerRef.current = setTimeout(() => {
      if (q.trim().length >= 2) {
        setFilters((prev) => ({ ...prev, codigo: q.trim() }));
        setPage(1);
      } else {
        setSearching(false);
      }
    }, 500);
  };

  const changeCategoria = (catId: string | null) => {
    setFilters((prev) => ({ ...prev, categoria: catId || undefined }));
    setPage(1);
  };

  const changeCondicion = (cond: MuebleCondition | null) => {
    setFilters((prev) => ({ ...prev, condicion: cond || undefined }));
    setPage(1);
  };

  const clearFilters = () => {
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

  const createCategoria = async (data: CreateCategoriaMueble): Promise<CategoriaMueble> => {
    const categoria = await categoriasMuebleApi.create(data);
    setCategorias((prev) => [...prev, categoria]);
    return categoria;
  };

  const updateCategoria = async (id: string, data: UpdateCategoriaMueble): Promise<CategoriaMueble> => {
    const categoria = await categoriasMuebleApi.update(id, data);
    setCategorias((prev) => prev.map((c) => (c.id === id ? categoria : c)));
    return categoria;
  };

  const deleteCategoria = async (id: string): Promise<void> => {
    await categoriasMuebleApi.delete(id);
    setCategorias((prev) => prev.filter((c) => c.id !== id));
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
    createCategoria,
    updateCategoria,
    deleteCategoria,
  };
}
