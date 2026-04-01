import axiosInstance from "@/config/axios/axios.instance";
import type {
  Habitacion, PaginatedHabitaciones, CreateHabitacion, UpdateHabitacion,
  UpdateEstadoHabitacion, TipoHabitacion, CreateTipoHabitacion, UpdateTipoHabitacion,
  EstadoReservaHab,
} from "./types";

export const roomsApi = {
  getAll: async (page = 1, limit = 10, tipo?: string): Promise<PaginatedHabitaciones> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (tipo) params.set("tipo", tipo);
    const response = await axiosInstance.get<{ success: boolean; data: PaginatedHabitaciones }>(
      `/api/private/habitaciones?${params.toString()}`
    );
    return response.data.data;
  },

  getById: async (id: string, tipoReserva?: EstadoReservaHab[]): Promise<Habitacion> => {
    const params = new URLSearchParams();
    if (tipoReserva?.length) params.set("tipo_reserva", tipoReserva.join(","));
    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await axiosInstance.get<{ success: boolean; data: Habitacion }>(
      `/api/private/habitaciones/${id}${query}`
    );
    return response.data.data;
  },

  create: async (data: CreateHabitacion): Promise<Habitacion> => {
    if (data.imagenes && data.imagenes.length > 0) {
      const form = new FormData();
      form.append("nro_habitacion", data.nro_habitacion);
      form.append("tipo_habitacion_id", data.tipo_habitacion_id);
      form.append("piso", String(data.piso));
      form.append("tiene_ducha", String(data.tiene_ducha));
      form.append("tiene_banio", String(data.tiene_banio));
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
      tiene_ducha: data.tiene_ducha,
      tiene_banio: data.tiene_banio,
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
      if (data.tiene_ducha !== undefined) form.append("tiene_ducha", String(data.tiene_ducha));
      if (data.tiene_banio !== undefined) form.append("tiene_banio", String(data.tiene_banio));
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
      ...(data.tiene_ducha !== undefined && { tiene_ducha: data.tiene_ducha }),
      ...(data.tiene_banio !== undefined && { tiene_banio: data.tiene_banio }),
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
