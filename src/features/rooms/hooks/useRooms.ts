import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/config/authClient";
import { roomsApi, tiposHabitacionApi } from "../api";
import type { Habitacion, TipoHabitacion, CreateHabitacionDto, UpdateEstadoHabitacionDto } from "../types";

export function useHabitaciones() {
  const { data: session } = authClient.useSession();
  const [habitaciones, setHabitaciones] = useState<Habitacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHabitaciones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await roomsApi.getAll();
      setHabitaciones(data);
    } catch {
      setError("Error al cargar habitaciones");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchHabitaciones();
    }
  }, [session, fetchHabitaciones]);

  const createHabitacion = async (data: CreateHabitacionDto): Promise<Habitacion> => {
    const habitacion = await roomsApi.create(data);
    setHabitaciones(prev => [...prev, habitacion]);
    return habitacion;
  };

  const updateEstadoHabitacion = async (id: string, data: UpdateEstadoHabitacionDto): Promise<Habitacion> => {
    const habitacion = await roomsApi.updateEstado(id, data);
    setHabitaciones(prev => prev.map(h => h.id === id ? habitacion : h));
    return habitacion;
  };

  const deleteHabitacion = async (id: string): Promise<void> => {
    await roomsApi.delete(id);
    setHabitaciones(prev => prev.filter(h => h.id !== id));
  };

  return {
    habitaciones,
    loading,
    error,
    fetchHabitaciones,
    createHabitacion,
    updateEstadoHabitacion,
    deleteHabitacion,
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

  useEffect(() => {
    fetchHabitacion();
  }, [fetchHabitacion]);

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
    if (session) {
      fetchTipos();
    }
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

  return {
    tipos,
    loading,
    error,
    fetchTipos,
    createTipo,
    updateTipo,
    deleteTipo,
  };
}
