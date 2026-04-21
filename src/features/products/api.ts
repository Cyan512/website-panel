import axiosInstance from "@/shared/lib/axios";
import type { Producto, PaginatedProductos, CreateProducto, UpdateProducto } from "./types";

export const productosApi = {
  getAll: async (page = 1, limit = 10): Promise<PaginatedProductos> => {
    const response = await axiosInstance.get<{ success: boolean; data: PaginatedProductos }>(
      "/api/private/productos",
      { params: { page, limit } }
    );
    return response.data.data;
  },

  getById: async (id: string): Promise<Producto> => {
    const response = await axiosInstance.get<{ success: boolean; data: Producto }>(`/api/private/productos/${id}`);
    return response.data.data;
  },

  create: async (data: CreateProducto): Promise<Producto> => {
    const response = await axiosInstance.post<{ success: boolean; data: Producto }>("/api/private/productos", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateProducto): Promise<Producto> => {
    const response = await axiosInstance.put<{ success: boolean; data: Producto }>(`/api/private/productos/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/private/productos/${id}`);
  },
};

