import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/config/authClient";
import { reservasApi } from "../api";
import type { ReservaOutput, CreateReservaInput, UpdateReservaInput, CancelReservaInput } from "../types";

export function useReservas() {
  const { data: session } = authClient.useSession();
  const [reservas, setReservas] = useState<ReservaOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reservasApi.getAll();
      setReservas(data);
    } catch {
      setError("Error al cargar reservas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchReservas();
  }, [session, fetchReservas]);

  const createReserva = async (data: CreateReservaInput): Promise<ReservaOutput> => {
    const r = await reservasApi.create(data);
    setReservas((prev) => [r, ...prev]);
    return r;
  };

  const updateReserva = async (id: string, data: UpdateReservaInput): Promise<ReservaOutput> => {
    const r = await reservasApi.update(id, data);
    setReservas((prev) => prev.map((x) => (x.id === id ? r : x)));
    return r;
  };

  const cancelReserva = async (id: string, data: CancelReservaInput): Promise<ReservaOutput> => {
    const r = await reservasApi.cancel(id, data);
    setReservas((prev) => prev.map((x) => (x.id === id ? r : x)));
    return r;
  };

  const deleteReserva = async (id: string): Promise<void> => {
    await reservasApi.delete(id);
    setReservas((prev) => prev.filter((x) => x.id !== id));
  };

  return { reservas, loading, error, fetchReservas, createReserva, updateReserva, cancelReserva, deleteReserva };
}
