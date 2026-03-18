import axiosInstance from "@/config/axios/axios.instance";
import type { Mueble } from "@/app/stock/dom/Mueble";
import type { CreateMuebleDto } from "@/app/stock/dom/CreateMuebleDto";
import type { CreateMuebleRepositoryPort } from "@/app/stock/app/ports/output/create-mueble-repository.port";

export class CreateMuebleRepository implements CreateMuebleRepositoryPort {
  async create(data: CreateMuebleDto): Promise<Mueble> {
    const response = await axiosInstance.post<Mueble>("/api/catalogo-muebles", data);
    return response.data;
  }
}

export const createMuebleRepository = new CreateMuebleRepository();
