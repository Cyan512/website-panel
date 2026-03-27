import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/config/authClient";
import { canalesApi } from "../api";
import type { CanalOutput, CreateCanalInput, UpdateCanalInput } from "../types";

export function useCanales() {
  const { data: session } = authClient.useSession();
  const [canales, setCanales] = useState<CanalOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCanales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await canalesApi.getAll();
      setCanales(data);
    } catch {
      setError("Error al cargar canales");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchCanales();
  }, [session, fetchCanales]);

  const createCanal = async (data: CreateCanalInput): Promise<CanalOutput> => {
    const canal = await canalesApi.create(data);
    setCanales((prev) => [canal, ...prev]);
    return canal;
  };

  const updateCanal = async (id: string, data: UpdateCanalInput): Promise<CanalOutput> => {
    const canal = await canalesApi.update(id, data);
    setCanales((prev) => prev.map((c) => (c.id === id ? canal : c)));
    return canal;
  };

  const deleteCanal = async (id: string): Promise<void> => {
    await canalesApi.delete(id);
    setCanales((prev) => prev.filter((c) => c.id !== id));
  };

  return { canales, loading, error, fetchCanales, createCanal, updateCanal, deleteCanal };
}
