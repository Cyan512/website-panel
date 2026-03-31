import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/config/authClient";
import { huespedesApi } from "../api";
import type { Huesped, CreateHuesped, UpdateHuesped, PaginationMeta } from "../types";

export function useHuespedes(initialPage = 1, initialLimit = 10) {
  const { data: session } = authClient.useSession();
  const [huespedes, setHuespedes] = useState<Huesped[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: initialPage, limit: initialLimit, total: 0, totalPages: 1,
    hasNextPage: false, hasPreviousPage: false,
  });
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHuespedes = useCallback(async (p = page, l = limit, q = search) => {
    try {
      setLoading(true);
      setError(null);
      const data = await huespedesApi.getAll(p, l, q);
      setHuespedes(data.list);
      setPagination(data.pagination);
    } catch {
      setError("Error al cargar huéspedes");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    if (session) fetchHuespedes(page, limit, search);
  }, [session, page, limit, search]);

  const goToPage = (p: number) => setPage(p);
  const changeLimit = (l: number) => { setLimit(l); setPage(1); };
  const changeSearch = (q: string) => { setSearch(q); setPage(1); };

  const createHuesped = async (data: CreateHuesped): Promise<Huesped> => {
    const huesped = await huespedesApi.create(data);
    await fetchHuespedes(page, limit, search);
    return huesped;
  };

  const updateHuesped = async (id: string, data: UpdateHuesped): Promise<Huesped> => {
    const huesped = await huespedesApi.update(id, data);
    setHuespedes((prev) => prev.map((h) => (h.id === id ? huesped : h)));
    return huesped;
  };

  const deleteHuesped = async (id: string): Promise<void> => {
    await huespedesApi.delete(id);
    const newTotal = pagination.total - 1;
    const newTotalPages = Math.max(1, Math.ceil(newTotal / limit));
    const targetPage = page > newTotalPages ? newTotalPages : page;
    await fetchHuespedes(targetPage, limit, search);
    if (targetPage !== page) setPage(targetPage);
  };

  return {
    huespedes, pagination, page, limit, search, loading, error,
    fetchHuespedes: () => fetchHuespedes(page, limit, search),
    goToPage, changeLimit, changeSearch,
    createHuesped, updateHuesped, deleteHuesped,
  };
}

export function useHuesped(id: string) {
  const [huesped, setHuesped] = useState<Huesped | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHuesped = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await huespedesApi.getById(id);
      setHuesped(data);
    } catch {
      setError("Error al cargar huésped");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchHuesped(); }, [fetchHuesped]);

  return { huesped, loading, error, fetchHuesped };
}
