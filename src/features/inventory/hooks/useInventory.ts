import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/shared/lib/auth";
import { inventoryApi } from "../api";
import type { Mueble, CreateMuebleDto, UpdateMuebleDto } from "../types";

export function useInventory() {
  const { data: session } = authClient.useSession();
  const [muebles, setMuebles] = useState<Mueble[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMuebles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryApi.getAll();
      setMuebles(data);
    } catch {
      setError("Error al cargar inventario");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchMuebles();
    }
  }, [session, fetchMuebles]);

  const createMueble = async (data: CreateMuebleDto): Promise<Mueble> => {
    const mueble = await inventoryApi.create(data);
    setMuebles(prev => [...prev, mueble]);
    return mueble;
  };

  const updateMueble = async (id: string, data: UpdateMuebleDto): Promise<Mueble> => {
    const mueble = await inventoryApi.update(id, data);
    setMuebles(prev => prev.map(m => m.id === id ? mueble : m));
    return mueble;
  };

  const deleteMueble = async (id: string): Promise<void> => {
    await inventoryApi.delete(id);
    setMuebles(prev => prev.filter(m => m.id !== id));
  };

  return {
    muebles,
    loading,
    error,
    fetchMuebles,
    createMueble,
    updateMueble,
    deleteMueble,
  };
}

export function useMueble(id: string) {
  const [mueble, setMueble] = useState<Mueble | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMueble = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryApi.getById(id);
      setMueble(data);
    } catch {
      setError("Error al cargar mueble");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMueble();
  }, [fetchMueble]);

  return { mueble, loading, error, fetchMueble };
}

export const getMueblesService = {
  execute: () => inventoryApi.getAll(),
};
