import axiosInstance from "@/config/axios/axios.instance";
import type { Mueble } from "@/app/stock/dom/Mueble";
import type { MueblesRepositoryPort } from "@/app/stock/app/ports/output/muebles-repository.port";

export class GetMueblesRepository implements MueblesRepositoryPort {
  async getAll(): Promise<Mueble[]> {
    const response = await axiosInstance.get<Mueble[]>("/api/catalogo-muebles");
    return response.data;
  }
}

export const getMueblesRepository = new GetMueblesRepository();
