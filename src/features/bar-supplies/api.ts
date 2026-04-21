import axiosInstance from "@/shared/lib/axios";
import type {
  InsumoBar, CreateInsumoBar, UpdateInsumoBar,
  MovimientoBar, CreateMovimientoBar, MovimientoBarFilters,
} from "./types";

export const insumosBarApi = {
  getAll: async (): Promise<InsumoBar[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: InsumoBar[] }>("/api/private/bar/insumos");
    return response.data.data;
  },

  getById: async (id: string): Promise<InsumoBar> => {
    const response = await axiosInstance.get<{ success: boolean; data: InsumoBar }>(`/api/private/bar/insumos/${id}`);
    return response.data.data;
  },

  create: async (data: CreateInsumoBar): Promise<InsumoBar> => {
    const response = await axiosInstance.post<{ success: boolean; data: InsumoBar }>("/api/private/bar/insumos", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateInsumoBar): Promise<InsumoBar> => {
    const response = await axiosInstance.put<{ success: boolean; data: InsumoBar }>(`/api/private/bar/insumos/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/private/bar/insumos/${id}`);
  },
};

export const movimientosBarApi = {
  getAll: async (filters?: MovimientoBarFilters): Promise<MovimientoBar[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: MovimientoBar[] }>(
      "/api/private/bar/movimientos",
      { params: filters }
    );
    return response.data.data;
  },

  create: async (data: CreateMovimientoBar): Promise<MovimientoBar> => {
    const response = await axiosInstance.post<{ success: boolean; data: MovimientoBar }>(
      "/api/private/bar/movimientos",
      data
    );
    return response.data.data;
  },
};
