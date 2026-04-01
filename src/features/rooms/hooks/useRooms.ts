import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/config/authClient";
import { roomsApi, tiposHabitacionApi } from "../api";
import type { Habitacion, TipoHabitacion, CreateHabitacion, UpdateEstadoHabitacion, PaginatedHabitaciones } from "../types";

export function useHabitaciones(initialPage = 1, initialLimit = 10) {
  const { data: session } = authClient.useSession();
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [pagination, setPagination] = useState<PaginatedHabitaciones["pagination"]>({
    page: initialPage, limit: initialLimit, total: 0, totalPages: 1,
    hasNextPage: false, hasPreviousPage: false,
  });
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [tipo, setTipo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHabitaciones = useCallback(async (p = page, l = limit, t = tipo) => {
    try {
      setLoading(true);
      setError(null);
      const data = await roomsApi.getAll(p, l, t || undefined);
      setHabitaciones(data.list);
      setPagination(data.pagination);
    } catch {
      setError("Error al cargar habitaciones");
    } finally {
      setLoading(false);
    }
  }, [page, limit, tipo]);

  useEffect(() => {
    if (session) fetchHabitaciones(page, limit, tipo);
  }, [session, page, limit, tipo]);

  const goToPage = (p: number) => setPage(p);
  const changeLimit = (l: number) => { setLimit(l); setPage(1); };
  const changeTipo = (t: string) => { setTipo(t); setPage(1); };

  const createHabitacion = async (data: CreateHabitacion): Promise<Habitacion> => {
    const habitacion = await roomsApi.create(data);
    await fetchHabitaciones(page, limit, tipo);
    return habitacion;
  };

  const updateHabitacion = async (id: string, data: Parameters<typeof roomsApi.update>[1]): Promise<Habitacion> => {
    const habitacion = await roomsApi.update(id, data);
    setHabitaciones(prev => prev.map(h => h.id === id ? habitacion : h));
    return habitacion;
  };

  const updateEstadoHabitacion = async (id: string, data: UpdateEstadoHabitacion): Promise<Habitacion> => {
    const habitacion = await roomsApi.updateEstado(id, data);
    setHabitaciones(prev => prev.map(h => h.id === id ? habitacion : h));
    return habitacion;
  };

  const deleteHabitacion = async (id: string): Promise<void> => {
    await roomsApi.delete(id);
    const newTotal = pagination.total - 1;
    const newTotalPages = Math.max(1, Math.ceil(newTotal / limit));
    const targetPage = page > newTotalPages ? newTotalPages : page;
    await fetchHabitaciones(targetPage, limit, tipo);
    if (targetPage !== page) setPage(targetPage);
  };

  return {
    habitaciones, pagination, page, limit, tipo, loading, error,
    fetchHabitaciones: () => fetchHabitaciones(page, limit, tipo),
    goToPage, changeLimit, changeTipo,
    createHabitacion, updateHabitacion, updateEstadoHabitacion, deleteHabitacion,
  };
}

export function useHabitacion(id: string) {
  const [habitacion, setHabitacion] = useState<Habitacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHabitacion = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await roomsApi.getById(id);
      setHabitacion(data);
    } catch {
      setError("Error al cargar habitación");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchHabitacion(); }, [fetchHabitacion]);

  return { habitacion, loading, error, fetchHabitacion };
}

export function useTiposHabitacion() {
  const { data: session } = authClient.useSession();
  const [tipos, setTipos] = useState<TipoHabitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTipos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tiposHabitacionApi.getAll();
      setTipos(data);
    } catch {
      setError("Error al cargar tipos de habitación");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchTipos();
  }, [session, fetchTipos]);

  const createTipo = async (data: Parameters<typeof tiposHabitacionApi.create>[0]): Promise<TipoHabitacion> => {
    const tipo = await tiposHabitacionApi.create(data);
    setTipos(prev => [...prev, tipo]);
    return tipo;
  };

  const updateTipo = async (id: string, data: Parameters<typeof tiposHabitacionApi.update>[1]): Promise<TipoHabitacion> => {
    const tipo = await tiposHabitacionApi.update(id, data);
    setTipos(prev => prev.map(t => t.id === id ? tipo : t));
    return tipo;
  };

  const deleteTipo = async (id: string): Promise<void> => {
    await tiposHabitacionApi.delete(id);
    setTipos(prev => prev.filter(t => t.id !== id));
  };

  return { tipos, loading, error, fetchTipos, createTipo, updateTipo, deleteTipo };
}
