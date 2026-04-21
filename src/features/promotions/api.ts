import axiosInstance from "@/shared/lib/axios";
import type { Promocion, CreatePromocion, UpdatePromocion } from "./types";

export const promocionesApi = {
  getAll: async (): Promise<Promocion[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: Promocion[] }>("/api/private/promociones");
    return response.data.data;
  },

  getById: async (id: string): Promise<Promocion> => {
    const response = await axiosInstance.get<{ success: boolean; data: Promocion }>(`/api/private/promociones/${id}`);
    return response.data.data;
  },

  create: async (data: CreatePromocion): Promise<Promocion> => {
    const response = await axiosInstance.post<{ success: boolean; data: Promocion }>("/api/private/promociones", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdatePromocion): Promise<Promocion> => {
    const response = await axiosInstance.put<{ success: boolean; data: Promocion }>(`/api/private/promociones/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/private/promociones/${id}`);
  },
};
