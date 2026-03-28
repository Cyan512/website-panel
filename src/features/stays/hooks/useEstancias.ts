import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/config/authClient";
import { estanciasApi } from "../api";
import type { Estancia, CreateEstancia, UpdateEstancia, CheckoutEstancia } from "../types";

export function useEstancias() {
  const { data: session } = authClient.useSession();
  const [estancias, setEstancias] = useState<Estancia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEstancias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await estanciasApi.getAll();
      setEstancias(data);
    } catch {
      setError("Error al cargar estancias");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchEstancias();
  }, [session, fetchEstancias]);

  const createEstancia = async (data: CreateEstancia): Promise<Estancia> => {
    const estancia = await estanciasApi.create(data);
    setEstancias((prev) => [estancia, ...prev]);
    return estancia;
  };

  const updateEstancia = async (id: string, data: UpdateEstancia): Promise<Estancia> => {
    const estancia = await estanciasApi.update(id, data);
    setEstancias((prev) => prev.map((e) => (e.id === id ? estancia : e)));
    return estancia;
  };

  const checkoutEstancia = async (id: string, data: CheckoutEstancia): Promise<Estancia> => {
    const estancia = await estanciasApi.checkout(id, data);
    setEstancias((prev) => prev.map((e) => (e.id === id ? estancia : e)));
    return estancia;
  };

  const deleteEstancia = async (id: string): Promise<void> => {
    await estanciasApi.delete(id);
    setEstancias((prev) => prev.filter((e) => e.id !== id));
  };

  return { estancias, loading, error, fetchEstancias, createEstancia, updateEstancia, checkoutEstancia, deleteEstancia };
}
