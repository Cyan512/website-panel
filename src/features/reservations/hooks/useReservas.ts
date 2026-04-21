import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/shared/lib/auth";
import { reservasApi } from "../api";
import type { Reserva, CreateReserva, UpdateReserva, CancelReserva, UpdateEstadoReserva, PaginationMeta } from "../types";

export function useReservas(initialPage = 1, initialLimit = 10) {
  const { data: session } = authClient.useSession();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: initialPage, limit: initialLimit, total: 0, totalPages: 1,
    hasNextPage: false, hasPreviousPage: false,
  });
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservas = useCallback(async (p = page, l = limit, q = search, t = tipo) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reservasApi.getAll(p, l, q || undefined, t || undefined);
      setReservas(data.list);
      setPagination(data.pagination);
    } catch {
      setError("Error al cargar reservas");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, tipo]);

  useEffect(() => {
    if (session) fetchReservas(page, limit, search, tipo);
  }, [session, page, limit, search, tipo]);

  const goToPage = (p: number) => setPage(p);
  const changeLimit = (l: number) => { setLimit(l); setPage(1); };
  const changeSearch = (q: string) => { setSearch(q); setPage(1); };
  const changeTipo = (t: string) => { setTipo(t); setPage(1); };

  const createReserva = async (data: CreateReserva): Promise<Reserva> => {
    const r = await reservasApi.create(data);
    await fetchReservas(page, limit, search, tipo);
    return r;
  };

  const updateReserva = async (id: string, data: UpdateReserva): Promise<Reserva> => {
    const r = await reservasApi.update(id, data);
    setReservas((prev) => prev.map((x) => (x.id === id ? r : x)));
    return r;
  };

  const updateEstadoReserva = async (id: string, data: UpdateEstadoReserva): Promise<Reserva> => {
    const r = await reservasApi.updateEstado(id, data);
    setReservas((prev) => prev.map((x) => (x.id === id ? r : x)));
    return r;
  };

  const cancelReserva = async (id: string, data: CancelReserva): Promise<Reserva> => {
    const r = await reservasApi.cancel(id, data);
    setReservas((prev) => prev.map((x) => (x.id === id ? r : x)));
    return r;
  };

  const deleteReserva = async (id: string): Promise<void> => {
    await reservasApi.delete(id);
    const newTotal = pagination.total - 1;
    const newTotalPages = Math.max(1, Math.ceil(newTotal / limit));
    const targetPage = page > newTotalPages ? newTotalPages : page;
    await fetchReservas(targetPage, limit, search, tipo);
    if (targetPage !== page) setPage(targetPage);
  };

  return {
    reservas, pagination, page, limit, search, tipo, loading, error,
    fetchReservas: () => fetchReservas(page, limit, search, tipo),
    goToPage, changeLimit, changeSearch, changeTipo,
    createReserva, updateReserva, updateEstadoReserva, cancelReserva, deleteReserva,
  };
}
