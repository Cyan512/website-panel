import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/shared/lib/auth";
import { promocionesApi } from "../api";
import type { Promocion, CreatePromocion, UpdatePromocion } from "../types";

export function usePromociones() {
  const { data: session } = authClient.useSession();
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchPromociones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await promocionesApi.getAll();
      setPromociones(data);
    } catch {
      setError("Error al cargar promociones");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchPromociones();
  }, [session, fetchPromociones]);

  const createPromocion = async (data: CreatePromocion): Promise<Promocion> => {
    const promo = await promocionesApi.create(data);
    setPromociones((prev) => [promo, ...prev]);
    return promo;
  };

  const updatePromocion = async (id: string, data: UpdatePromocion): Promise<Promocion> => {
    const promo = await promocionesApi.update(id, data);
    setPromociones((prev) => prev.map((p) => (p.id === id ? promo : p)));
    return promo;
  };

  const deletePromocion = async (id: string): Promise<void> => {
    await promocionesApi.delete(id);
    setPromociones((prev) => prev.filter((p) => p.id !== id));
  };

  const filtered = promociones.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.codigo.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return {
    promociones,
    filtered,
    paginated,
    loading,
    error,
    search,
    setSearch,
    page,
    setPage,
    limit,
    setLimit,
    totalPages,
    fetchPromociones,
    createPromocion,
    updatePromocion,
    deletePromocion,
  };
}
