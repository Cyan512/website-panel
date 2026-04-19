import axiosInstance from "@/config/axios/axios.instance";
import type { Mueble, CreateMueble, UpdateMueble } from "./types";
import type { CategoriaMueble } from "../furniture-categories/types";

export const mueblesApi = {
  getAll: async (): Promise<Mueble[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: Mueble[] }>("/api/private/muebles");
    return response.data.data;
  },

  getById: async (id: string): Promise<Mueble> => {
    const response = await axiosInstance.get<{ success: boolean; data: Mueble }>(`/api/private/muebles/${id}`);
    return response.data.data;
  },

  create: async (data: CreateMueble): Promise<Mueble> => {
    if (data.imagen && data.imagen.length > 0) {
      const form = new FormData();
      form.append("codigo", data.codigo);
      form.append("nombre", data.nombre);
      form.append("categoria_id", data.categoria_id);
      form.append("habitacion_id", data.habitacion_id);
      if (data.condicion) form.append("condicion", data.condicion);
      if (data.descripcion) form.append("descripcion", data.descripcion);
      if (data.fecha_adquisicion) form.append("fecha_adquisicion", data.fecha_adquisicion);
      if (data.ultima_revision) form.append("ultima_revision", data.ultima_revision);
      data.imagen.forEach((f) => form.append("imagen", f));
      const response = await axiosInstance.post<{ success: boolean; data: Mueble }>("/api/private/muebles", form);
      return response.data.data;
    }
    const response = await axiosInstance.post<{ success: boolean; data: Mueble }>("/api/private/muebles", {
      codigo: data.codigo, nombre: data.nombre, categoria_id: data.categoria_id,
      habitacion_id: data.habitacion_id, condicion: data.condicion,
      ...(data.descripcion && { descripcion: data.descripcion }),
      ...(data.fecha_adquisicion && { fecha_adquisicion: data.fecha_adquisicion }),
      ...(data.ultima_revision && { ultima_revision: data.ultima_revision }),
    });
    return response.data.data;
  },

  update: async (id: string, data: UpdateMueble): Promise<Mueble> => {
    if (data.imagen && data.imagen.length > 0) {
      const form = new FormData();
      if (data.codigo) form.append("codigo", data.codigo);
      if (data.nombre) form.append("nombre", data.nombre);
      if (data.categoria_id) form.append("categoria_id", data.categoria_id);
      if (data.habitacion_id) form.append("habitacion_id", data.habitacion_id);
      if (data.condicion) form.append("condicion", data.condicion);
      if (data.descripcion) form.append("descripcion", data.descripcion);
      if (data.fecha_adquisicion) form.append("fecha_adquisicion", data.fecha_adquisicion);
      if (data.ultima_revision) form.append("ultima_revision", data.ultima_revision);
      data.imagen.forEach((f) => form.append("imagen", f));
      const response = await axiosInstance.put<{ success: boolean; data: Mueble }>(`/api/private/muebles/${id}`, form);
      return response.data.data;
    }
    const response = await axiosInstance.put<{ success: boolean; data: Mueble }>(`/api/private/muebles/${id}`, {
      ...(data.codigo && { codigo: data.codigo }),
      ...(data.nombre && { nombre: data.nombre }),
      ...(data.categoria_id && { categoria_id: data.categoria_id }),
      ...(data.habitacion_id && { habitacion_id: data.habitacion_id }),
      ...(data.condicion && { condicion: data.condicion }),
      ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
      ...(data.fecha_adquisicion && { fecha_adquisicion: data.fecha_adquisicion }),
      ...(data.ultima_revision && { ultima_revision: data.ultima_revision }),
    });
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/private/muebles/${id}`);
  },
};

export const categoriasApi = {
  getAll: async (): Promise<CategoriaMueble[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: CategoriaMueble[] }>("/api/private/categorias-mueble");
    return response.data.data;
  },
};
