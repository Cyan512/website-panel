import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/shared/lib/auth";
import { tiposHabitacionApi } from "../api";
import type { TipoHabitacion, CreateTipoHabitacion, UpdateTipoHabitacion } from "../types";

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

  const createTipo = async (data: CreateTipoHabitacion): Promise<TipoHabitacion> => {
    const tipo = await tiposHabitacionApi.create(data);
    setTipos((prev) => [tipo, ...prev]);
    return tipo;
  };

  const updateTipo = async (id: string, data: UpdateTipoHabitacion): Promise<TipoHabitacion> => {
    const tipo = await tiposHabitacionApi.update(id, data);
    setTipos((prev) => prev.map((t) => (t.id === id ? tipo : t)));
    return tipo;
  };

  const deleteTipo = async (id: string): Promise<void> => {
    await tiposHabitacionApi.delete(id);
    setTipos((prev) => prev.filter((t) => t.id !== id));
  };

  return { tipos, loading, error, fetchTipos, createTipo, updateTipo, deleteTipo };
}
