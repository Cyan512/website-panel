import axiosInstance from "@/shared/lib/axios";
import type {
  InsumoCocina, CreateInsumoCocina, UpdateInsumoCocina,
  MovimientoCocina, CreateMovimientoCocina, MovimientoCocinaFilters,
} from "./types";

export const insumosCocinaApi = {
  getAll: async (): Promise<InsumoCocina[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: InsumoCocina[] }>("/api/private/cocina/insumos");
    return response.data.data;
  },

  getById: async (id: string): Promise<InsumoCocina> => {
    const response = await axiosInstance.get<{ success: boolean; data: InsumoCocina }>(`/api/private/cocina/insumos/${id}`);
    return response.data.data;
  },

  create: async (data: CreateInsumoCocina): Promise<InsumoCocina> => {
    const response = await axiosInstance.post<{ success: boolean; data: InsumoCocina }>("/api/private/cocina/insumos", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateInsumoCocina): Promise<InsumoCocina> => {
    const response = await axiosInstance.put<{ success: boolean; data: InsumoCocina }>(`/api/private/cocina/insumos/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/private/cocina/insumos/${id}`);
  },
};

export const movimientosCocinaApi = {
  getAll: async (filters?: MovimientoCocinaFilters): Promise<MovimientoCocina[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: MovimientoCocina[] }>(
      "/api/private/cocina/movimientos",
      { params: filters }
    );
    return response.data.data;
  },

  create: async (data: CreateMovimientoCocina): Promise<MovimientoCocina> => {
    const response = await axiosInstance.post<{ success: boolean; data: MovimientoCocina }>(
      "/api/private/cocina/movimientos",
      data
    );
    return response.data.data;
  },
};
