import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/config/authClient";
import { huespedesApi } from "../api";
import type { Huesped, CreateHuespedDto, UpdateHuespedDto } from "../types";

export function useHuespedes() {
  const { data: session } = authClient.useSession();
  const [huespedes, setHuespedes] = useState<Huesped[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHuespedes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await huespedesApi.getAll();
      setHuespedes(data);
    } catch {
      setError("Error al cargar huéspedes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchHuespedes();
    }
  }, [session, fetchHuespedes]);

  const createHuesped = async (data: CreateHuespedDto): Promise<Huesped> => {
    const huesped = await huespedesApi.create(data);
    setHuespedes(prev => [...prev, huesped]);
    return huesped;
  };

  const updateHuesped = async (id: string, data: UpdateHuespedDto): Promise<Huesped> => {
    const huesped = await huespedesApi.update(id, data);
    setHuespedes(prev => prev.map(h => h.id === id ? huesped : h));
    return huesped;
  };

  const deleteHuesped = async (id: string): Promise<void> => {
    await huespedesApi.delete(id);
    setHuespedes(prev => prev.filter(h => h.id !== id));
  };

  return {
    huespedes,
    loading,
    error,
    fetchHuespedes,
    createHuesped,
    updateHuesped,
    deleteHuesped,
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

  useEffect(() => {
    fetchHuesped();
  }, [fetchHuesped]);

  return { huesped, loading, error, fetchHuesped };
}
