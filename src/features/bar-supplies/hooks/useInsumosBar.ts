import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/shared/lib/auth";
import { insumosBarApi, movimientosBarApi } from "../api";
import type { InsumoBar, CreateInsumoBar, UpdateInsumoBar, MovimientoBar, CreateMovimientoBar } from "../types";

export function useInsumosBar() {
  const { data: session } = authClient.useSession();
  const [insumos, setInsumos] = useState<InsumoBar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchInsumos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await insumosBarApi.getAll();
      setInsumos(data);
    } catch {
      setError("Error al cargar insumos de bar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchInsumos();
  }, [session, fetchInsumos]);

  const createInsumo = async (data: CreateInsumoBar): Promise<InsumoBar> => {
    const insumo = await insumosBarApi.create(data);
    setInsumos((prev) => [insumo, ...prev]);
    return insumo;
  };

  const updateInsumo = async (id: string, data: UpdateInsumoBar): Promise<InsumoBar> => {
    const insumo = await insumosBarApi.update(id, data);
    setInsumos((prev) => prev.map((i) => (i.id === id ? insumo : i)));
    return insumo;
  };

  const deleteInsumo = async (id: string): Promise<void> => {
    await insumosBarApi.delete(id);
    setInsumos((prev) => prev.filter((i) => i.id !== id));
  };

  const registrarMovimiento = async (data: CreateMovimientoBar): Promise<MovimientoBar> => {
    const mov = await movimientosBarApi.create(data);
    // Refresh to get updated stock
    await fetchInsumos();
    return mov;
  };

  const filtered = insumos.filter((i) => {
    const q = search.toLowerCase();
    return !q || i.nombre.toLowerCase().includes(q) || i.codigo.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return {
    insumos,
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
    fetchInsumos,
    createInsumo,
    updateInsumo,
    deleteInsumo,
    registrarMovimiento,
  };
}
