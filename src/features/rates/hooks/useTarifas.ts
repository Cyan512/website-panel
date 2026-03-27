import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/config/authClient";
import { tarifasApi, canalesApi } from "../api";
import type { TarifaOutput, CreateTarifaInput, UpdateTarifaInput, CanalOutput } from "../types";

export function useTarifas() {
  const { data: session } = authClient.useSession();
  const [tarifas, setTarifas] = useState<TarifaOutput[]>([]);
  const [canales, setCanales] = useState<CanalOutput[]>([]);
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

  const createTarifa = async (data: CreateTarifaInput): Promise<TarifaOutput> => {
    const tarifa = await tarifasApi.create(data);
    setTarifas((prev) => [tarifa, ...prev]);
    return tarifa;
  };

  const updateTarifa = async (id: string, data: UpdateTarifaInput): Promise<TarifaOutput> => {
    const tarifa = await tarifasApi.update(id, data);
    setTarifas((prev) => prev.map((t) => (t.id === id ? tarifa : t)));
    return tarifa;
  };

  const deleteTarifa = async (id: string): Promise<void> => {
    await tarifasApi.delete(id);
    setTarifas((prev) => prev.filter((t) => t.id !== id));
  };

  return { tarifas, canales, loading, error, fetchTarifas, createTarifa, updateTarifa, deleteTarifa };
}
