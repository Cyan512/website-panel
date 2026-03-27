import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/config/authClient";
import { categoriasMuebleApi } from "../api";
import type { CategoriaMuebleOutputDto, CreateCategoriaMuebleDto, UpdateCategoriaMuebleDto } from "../types";

export function useCategoriasMueble() {
  const { data: session } = authClient.useSession();
  const [categorias, setCategorias] = useState<CategoriaMuebleOutputDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategorias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoriasMuebleApi.getAll();
      setCategorias(data);
    } catch {
      setError("Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchCategorias();
  }, [session, fetchCategorias]);

  const createCategoria = async (data: CreateCategoriaMuebleDto): Promise<CategoriaMuebleOutputDto> => {
    const cat = await categoriasMuebleApi.create(data);
    setCategorias((prev) => [cat, ...prev]);
    return cat;
  };

  const updateCategoria = async (id: string, data: UpdateCategoriaMuebleDto): Promise<CategoriaMuebleOutputDto> => {
    const cat = await categoriasMuebleApi.update(id, data);
    setCategorias((prev) => prev.map((c) => (c.id === id ? cat : c)));
    return cat;
  };

  const deleteCategoria = async (id: string): Promise<void> => {
    await categoriasMuebleApi.delete(id);
    setCategorias((prev) => prev.filter((c) => c.id !== id));
  };

  return { categorias, loading, error, fetchCategorias, createCategoria, updateCategoria, deleteCategoria };
}
