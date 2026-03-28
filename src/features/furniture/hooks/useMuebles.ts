import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/config/authClient";
import { mueblesApi, categoriasApi } from "../api";
import type { Mueble, CreateMueble, UpdateMueble } from "../types";
import type { CategoriaMueble } from "@/features/furniture-categories/types";

export function useMuebles() {
  const { data: session } = authClient.useSession();
  const [muebles, setMuebles] = useState<Mueble[]>([]);
  const [categorias, setCategorias] = useState<CategoriaMueble[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMuebles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [mueblesData, categoriasData] = await Promise.all([
        mueblesApi.getAll(),
        categoriasApi.getAll(),
      ]);
      setMuebles(mueblesData);
      setCategorias(categoriasData);
    } catch {
      setError("Error al cargar muebles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchMuebles();
  }, [session, fetchMuebles]);

  const createMueble = async (data: CreateMueble): Promise<Mueble> => {
    const mueble = await mueblesApi.create(data);
    setMuebles((prev) => [mueble, ...prev]);
    return mueble;
  };

  const updateMueble = async (id: string, data: UpdateMueble): Promise<Mueble> => {
    const mueble = await mueblesApi.update(id, data);
    setMuebles((prev) => prev.map((m) => (m.id === id ? mueble : m)));
    return mueble;
  };

  const deleteMueble = async (id: string): Promise<void> => {
    await mueblesApi.delete(id);
    setMuebles((prev) => prev.filter((m) => m.id !== id));
  };

  return { muebles, categorias, loading, error, fetchMuebles, createMueble, updateMueble, deleteMueble };
}
