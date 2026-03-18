import axiosInstance from "@/config/axios/axios.instance";
import type { Habitacion, CreateHabitacionDto } from "@/app/room/dom/Habitacion";
import type { CreateHabitacionRepositoryPort } from "@/app/room/app/ports/output/create-habitacion-repository.port";

export class CreateHabitacionRepository implements CreateHabitacionRepositoryPort {
  async create(data: CreateHabitacionDto): Promise<Habitacion> {
    const cleanData: Record<string, unknown> = {
      nro_habitacion: data.nro_habitacion,
      tipo_id: data.tipo_id,
      piso: data.piso,
    };

    if (data.url_imagen) cleanData.url_imagen = data.url_imagen;
    if (data.estado) cleanData.estado = data.estado;
    if (data.limpieza) cleanData.limpieza = data.limpieza;
    if (data.notas) cleanData.notas = data.notas;
    if (data.muebles && data.muebles.length > 0) cleanData.muebles = data.muebles;

    const response = await axiosInstance.post<{ data: Habitacion }>("/api/habitaciones", cleanData);
    return response.data.data;
  }
}

export const createHabitacionRepository = new CreateHabitacionRepository();
