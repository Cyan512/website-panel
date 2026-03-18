import axiosInstance from "@/config/axios/axios.instance";
import type { Mueble } from "@/app/stock/dom/Mueble";
import type { MuebleRepositoryPort } from "@/app/stock/app/ports/output/mueble-repository.port";

export class GetMuebleRepository implements MuebleRepositoryPort {
  async getById(id: string): Promise<Mueble> {
    const response = await axiosInstance.get<Mueble>(`/api/catalogo-muebles/${id}`);
    return response.data;
  }
}

export const getMuebleRepository = new GetMuebleRepository();
