import axiosInstance from "@/shared/lib/axios";
import type {
  Habitacion, PaginatedHabitaciones, CreateHabitacion, UpdateHabitacion,
  UpdateEstadoHabitacion, TipoHabitacion, CreateTipoHabitacion, UpdateTipoHabitacion,
  EstadoReservaHab, Internacionalizacion, UpdateInternacionalizacion,
} from "./types";

export const roomsApi = {
  getAll: async (
    page = 1,
    limit = 10,
filters: { tipo?: string; numero?: string; estado?: boolean } = {},
  signal?: AbortSignal,
 ): Promise<PaginatedHabitaciones> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters.tipo) params.set("tipo", filters.tipo);
  if (filters.numero) params.set("numero", filters.numero);
    if (filters.estado !== undefined) params.set("estado", String(filters.estado));
    const response = await axiosInstance.get<{ success: boolean; data: PaginatedHabitaciones }>(
      `/api/private/habitaciones?${params.toString()}`,
      { signal },
    );
    return response.data.data;
  },

  getByNumero: async (numero: string, signal?: AbortSignal): Promise<Habitacion[]> => {
    const params = new URLSearchParams({ numero });
    const response = await axiosInstance.get<{ success: boolean; data: PaginatedHabitaciones }>(
      `/api/private/habitaciones?${params.toString()}`,
      { signal },
    );
    return response.data.data.list;
  },

  getById: async (id: string, tipoReserva?: EstadoReservaHab[], signal?: AbortSignal): Promise<Habitacion> => {
    const params = new URLSearchParams();
    if (tipoReserva?.length) params.set("tipo_reserva", tipoReserva.join(","));
    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await axiosInstance.get<{ success: boolean; data: { habitacion: Habitacion; fechas_reserva: import("./types").FechaReserva[] } }>(
      `/api/private/habitaciones/${id}${query}`,
      { signal },
    );
    const { habitacion, fechas_reserva } = response.data.data;
    return { ...habitacion, fechas_reserva };
  },

  create: async (data: CreateHabitacion): Promise<Habitacion> => {
    if (data.imagenes && data.imagenes.length > 0) {
      const form = new FormData();
      form.append("nro_habitacion", data.nro_habitacion);
      form.append("tipo_habitacion_id", data.tipo_habitacion_id);
      form.append("piso", String(data.piso));
      if (data.feature) form.append("feature", data.feature);
      if (data.amenities) form.append("amenities", data.amenities);
      if (data.estado !== undefined) form.append("estado", String(data.estado));
      if (data.descripcion) form.append("descripcion", data.descripcion);
      data.imagenes.forEach((f) => form.append("imagenes", f));
      const response = await axiosInstance.post<{ data: Habitacion }>("/api/private/habitaciones", form);
      return response.data.data;
    }

    const response = await axiosInstance.post<{ data: Habitacion }>("/api/private/habitaciones", {
      nro_habitacion: data.nro_habitacion,
      tipo_habitacion_id: data.tipo_habitacion_id,
      piso: data.piso,
      ...(data.feature && { feature: data.feature }),
      ...(data.amenities && { amenities: data.amenities }),
      ...(data.estado !== undefined && { estado: data.estado }),
      ...(data.descripcion && { descripcion: data.descripcion }),
    });
    return response.data.data;
  },

  update: async (id: string, data: UpdateHabitacion): Promise<Habitacion> => {
    if (data.imagenes && data.imagenes.length > 0) {
      const form = new FormData();
      if (data.nro_habitacion) form.append("nro_habitacion", data.nro_habitacion);
      if (data.tipo_habitacion_id) form.append("tipo_habitacion_id", data.tipo_habitacion_id);
      if (data.piso !== undefined) form.append("piso", String(data.piso));
      if (data.feature !== undefined) form.append("feature", data.feature);
      if (data.amenities !== undefined) form.append("amenities", data.amenities);
      if (data.estado !== undefined) form.append("estado", String(data.estado));
      if (data.descripcion) form.append("descripcion", data.descripcion);
      if (data.imagenes_existentes) {
        data.imagenes_existentes.forEach((url) => form.append("imagenes_existentes", url));
      }
      data.imagenes.forEach((f) => form.append("imagenes", f));
      const response = await axiosInstance.put<{ data: Habitacion }>(`/api/private/habitaciones/${id}`, form);
      return response.data.data;
    }

    const response = await axiosInstance.put<{ data: Habitacion }>(`/api/private/habitaciones/${id}`, {
      ...(data.nro_habitacion && { nro_habitacion: data.nro_habitacion }),
      ...(data.tipo_habitacion_id && { tipo_habitacion_id: data.tipo_habitacion_id }),
      ...(data.piso !== undefined && { piso: data.piso }),
      ...(data.feature !== undefined && { feature: data.feature }),
      ...(data.amenities !== undefined && { amenities: data.amenities }),
      ...(data.estado !== undefined && { estado: data.estado }),
      ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
      ...(data.imagenes_existentes && { imagenes_existentes: data.imagenes_existentes }),
    });
    return response.data.data;
  },

  updateEstado: async (id: string, data: UpdateEstadoHabitacion): Promise<Habitacion> => {
    const response = await axiosInstance.patch<{ data: Habitacion }>(`/api/private/habitaciones/${id}/estado`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/private/habitaciones/${id}`);
  },
};

export const internacionalizacionApi = {
  getById: async (habitacionId: string): Promise<Internacionalizacion> => {
    const response = await axiosInstance.get<{ data: Internacionalizacion }>(`/api/private/internacionalizaciones/${habitacionId}`);
    return response.data.data;
  },

  create: async (habitacionId: string, data: UpdateInternacionalizacion): Promise<Internacionalizacion> => {
    const response = await axiosInstance.post<{ data: Internacionalizacion }>(`/api/private/internacionalizaciones/${habitacionId}`, data);
    return response.data.data;
  },

  update: async (habitacionId: string, data: UpdateInternacionalizacion): Promise<Internacionalizacion> => {
    const response = await axiosInstance.put<{ data: Internacionalizacion }>(`/api/private/internacionalizaciones/${habitacionId}`, data);
    return response.data.data;
  },

  delete: async (habitacionId: string): Promise<void> => {
    await axiosInstance.delete(`/api/private/internacionalizaciones/${habitacionId}`);
  },
};

export const tiposHabitacionApi = {
  getAll: async (): Promise<TipoHabitacion[]> => {
    const response = await axiosInstance.get<{ data: TipoHabitacion[] }>("/api/private/tipos-habitacion");
    return response.data.data;
  },

  getById: async (id: string): Promise<TipoHabitacion> => {
    const response = await axiosInstance.get<{ data: TipoHabitacion }>(`/api/private/tipos-habitacion/${id}`);
    return response.data.data;
  },

  create: async (data: CreateTipoHabitacion): Promise<TipoHabitacion> => {
    const response = await axiosInstance.post<{ data: TipoHabitacion }>("/api/private/tipos-habitacion", data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateTipoHabitacion): Promise<TipoHabitacion> => {
    const response = await axiosInstance.put<{ data: TipoHabitacion }>(`/api/private/tipos-habitacion/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/private/tipos-habitacion/${id}`);
  },
};
