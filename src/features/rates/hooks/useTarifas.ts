import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/shared/lib/auth";
import { tarifasApi, canalesApi } from "../api";
import type { Tarifa, CreateTarifa, UpdateTarifa } from "../types";
import type { Canal, CreateCanal, UpdateCanal } from "@/features/channels/types";

export function useTarifas() {
  const { data: session } = authClient.useSession();
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [canales, setCanales] = useState<Canal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTarifas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [tarifasData, canalesData] = await Promise.all([
        tarifasApi.getAll(),
        canalesApi.getAll(),
      ]);
      setTarifas(tarifasData);
      setCanales(canalesData);
    } catch {
      setError("Error al cargar tarifas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchTarifas();
  }, [session, fetchTarifas]);

  const createTarifa = async (data: CreateTarifa): Promise<Tarifa> => {
    const tarifa = await tarifasApi.create(data);
    setTarifas((prev) => [tarifa, ...prev]);
    return tarifa;
  };

  const updateTarifa = async (id: string, data: UpdateTarifa): Promise<Tarifa> => {
    const tarifa = await tarifasApi.update(id, data);
    setTarifas((prev) => prev.map((t) => (t.id === id ? tarifa : t)));
    return tarifa;
  };

  const deleteTarifa = async (id: string): Promise<void> => {
    await tarifasApi.delete(id);
    setTarifas((prev) => prev.filter((t) => t.id !== id));
  };

  const createCanal = async (data: CreateCanal): Promise<Canal> => {
    const canal = await canalesApi.create(data);
    setCanales((prev) => [canal, ...prev]);
    return canal;
  };

  const updateCanal = async (id: string, data: UpdateCanal): Promise<Canal> => {
    const canal = await canalesApi.update(id, data);
    setCanales((prev) => prev.map((c) => (c.id === id ? canal : c)));
    return canal;
  };

  const deleteCanal = async (id: string): Promise<void> => {
    await canalesApi.delete(id);
    setCanales((prev) => prev.filter((c) => c.id !== id));
  };

  return {
    tarifas,
    canales,
    loading,
    error,
    fetchTarifas,
    createTarifa,
    updateTarifa,
    deleteTarifa,
    createCanal,
    updateCanal,
    deleteCanal,
  };
}
