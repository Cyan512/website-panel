import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/shared/lib/auth";
import { pagosApi } from "../api";
import type { Pago, CreatePago, UpdatePago } from "../types";

export function usePagos() {
  const { data: session } = authClient.useSession();
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPagos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pagosApi.getAll();
      setPagos(data);
    } catch {
      setError("Error al cargar pagos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchPagos();
    }
  }, [session, fetchPagos]);

  const createPago = async (data: CreatePago): Promise<Pago> => {
    const pago = await pagosApi.create(data);
    setPagos(prev => [pago, ...prev]);
    return pago;
  };

  const updatePago = async (id: string, data: UpdatePago): Promise<Pago> => {
    const pago = await pagosApi.update(id, data);
    setPagos(prev => prev.map(p => p.id === id ? pago : p));
    return pago;
  };

  const deletePago = async (id: string): Promise<void> => {
    await pagosApi.delete(id);
    setPagos(prev => prev.filter(p => p.id !== id));
  };

  return {
    pagos,
    loading,
    error,
    fetchPagos,
    createPago,
    updatePago,
    deletePago,
  };
}

export function usePago(id: string) {
  const [pago, setPago] = useState<Pago | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPago = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await pagosApi.getById(id);
      setPago(data);
    } catch {
      setError("Error al cargar pago");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPago();
  }, [fetchPago]);

  return { pago, loading, error, fetchPago };
}
