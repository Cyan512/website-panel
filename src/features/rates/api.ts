import axiosInstance from "@/config/axios/axios.instance";
import type { TarifaOutput, CreateTarifaInput, UpdateTarifaInput, CanalOutput } from "./types";

export const tarifasApi = {
  getAll: async (): Promise<TarifaOutput[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: TarifaOutput[] }>("/api/tarifas");
    return response.data.data;
  },

  getById: async (id: string): Promise<TarifaOutput> => {
    const response = await axiosInstance.get<{ success: boolean; data: TarifaOutput }>(`/api/tarifas/${id}`);
    return response.data.data;
  },

  create: async (data: CreateTarifaInput): Promise<TarifaOutput> => {
    const response = await axiosInstance.post<{ success: boolean; data: TarifaOutput }>("/api/tarifas", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateTarifaInput): Promise<TarifaOutput> => {
    const response = await axiosInstance.put<{ success: boolean; data: TarifaOutput }>(`/api/tarifas/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/tarifas/${id}`);
  },
};

export const canalesApi = {
  getAll: async (): Promise<CanalOutput[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: CanalOutput[] }>("/api/canales");
    return response.data.data;
  },
};
