import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/shared/lib/auth";
import { foliosApi } from "../api";
import type { Folio, CreateFolio, UpdateFolio, PaginationMeta, CreateFolioProductoDto, CreateFolioServicio } from "../types";

export function useFolios(initialPage = 1, initialLimit = 10) {
  const { data: session } = authClient.useSession();
  const [folios, setFolios] = useState<Folio[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: initialPage, limit: initialLimit, total: 0, totalPages: 1,
    hasNextPage: false, hasPreviousPage: false,
  });
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<boolean | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFolios = useCallback(async (
    p = page,
    l = limit,
    estado = estadoFilter,
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await foliosApi.getAll({
        page: p,
        limit: l,
        ...(estado !== undefined && { estado }),
      });
      setFolios(data.list);
      setPagination(data.pagination);
    } catch {
      setError("Error al cargar folios");
    } finally {
      setLoading(false);
    }
  }, [page, limit, estadoFilter]);

  useEffect(() => {
    if (session) fetchFolios(page, limit, estadoFilter);
  }, [session, page, limit, estadoFilter]);

  const goToPage = (p: number) => setPage(p);
  const changeLimit = (l: number) => { setLimit(l); setPage(1); };
  const changeEstado = (estado: boolean | undefined) => { setEstadoFilter(estado); setPage(1); };

  const createFolio = async (data: CreateFolio): Promise<Folio> => {
    const folio = await foliosApi.create(data);
    await fetchFolios(page, limit, estadoFilter);
    return folio;
  };

  const updateFolio = async (id: string, data: UpdateFolio): Promise<Folio> => {
    const folio = await foliosApi.update(id, data);
    setFolios((prev) => prev.map((f) => (f.id === id ? folio : f)));
    return folio;
  };

  const deleteFolio = async (id: string): Promise<void> => {
    await foliosApi.delete(id);
    const newTotal = pagination.total - 1;
    const newTotalPages = Math.max(1, Math.ceil(newTotal / limit));
    const targetPage = page > newTotalPages ? newTotalPages : page;
    await fetchFolios(targetPage, limit, estadoFilter);
    if (targetPage !== page) setPage(targetPage);
  };

  const addProductoToFolio = async (folioId: string, data: CreateFolioProductoDto) => {
    const producto = await foliosApi.addProducto(folioId, data);
    return producto;
  };

  const addServicioToFolio = async (folioId: string, data: CreateFolioServicio) => {
    const servicio = await foliosApi.addServicio(folioId, data);
    return servicio;
  };

  // Client-side search on top of server results
  const filtered = search
    ? folios.filter((f) => {
        const q = search.toLowerCase();
        return (
          f.codigo.toLowerCase().includes(q) ||
          f.estanciaId.toLowerCase().includes(q) ||
          (f.observacion ?? "").toLowerCase().includes(q)
        );
      })
    : folios;

  return {
    folios,
    filtered,
    pagination,
    page,
    limit,
    search,
    setSearch,
    estadoFilter,
    loading,
    error,
    fetchFolios: () => fetchFolios(page, limit, estadoFilter),
    goToPage,
    changeLimit,
    changeEstado,
    createFolio,
    updateFolio,
    deleteFolio,
    addProductoToFolio,
    addServicioToFolio,
  } as const;
}
