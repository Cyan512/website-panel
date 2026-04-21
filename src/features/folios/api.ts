import axiosInstance from "@/shared/lib/axios";
import type { 
  Folio, 
  FolioWithConsumos, 
  FolioPaginated, 
  CreateFolio, 
  UpdateFolio, 
  ListFolio, 
  FolioProducto, 
  FolioServicio,
  CobrarResponse,
  CreateFolioProductoDto,
  CreateFolioServicio
} from "./types";

export const foliosApi = {
  getAll: async (params?: ListFolio): Promise<FolioPaginated> => {
    const response = await axiosInstance.get<{ success: boolean; data: FolioPaginated }>("/api/private/folios", { params });
    return response.data.data;
  },

  getById: async (id: string): Promise<FolioWithConsumos> => {
    const response = await axiosInstance.get<{ success: boolean; data: FolioWithConsumos }>(`/api/private/folios/${id}`);
    return response.data.data;
  },

  create: async (data: CreateFolio): Promise<Folio> => {
    const response = await axiosInstance.post<{ success: boolean; data: Folio }>("/api/private/folios", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateFolio): Promise<Folio> => {
    const response = await axiosInstance.put<{ success: boolean; data: Folio }>(`/api/private/folios/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/private/folios/${id}`);
  },

  addProducto: async (folioId: string, data: CreateFolioProductoDto): Promise<FolioProducto> => {
    const response = await axiosInstance.post<{ success: boolean; data: FolioProducto }>(
      `/api/private/folios/${folioId}/productos`,
      data
    );
    return response.data.data;
  },

  addServicio: async (folioId: string, data: CreateFolioServicio): Promise<FolioServicio> => {
    const response = await axiosInstance.post<{ success: boolean; data: FolioServicio }>(
      `/api/private/folios/${folioId}/servicios`,
      data
    );
    return response.data.data;
  },

  getConsumos: async (folioId: string): Promise<FolioWithConsumos> => {
    const response = await axiosInstance.get<{ success: boolean; data: FolioWithConsumos }>(`/api/private/folios/${folioId}/consumos`);
    return response.data.data;
  },

  cobrar: async (folioId: string): Promise<CobrarResponse> => {
    const response = await axiosInstance.post<{ success: boolean; data: CobrarResponse }>(`/api/private/folios/${folioId}/cobrar`);
    return response.data.data;
  },
};
