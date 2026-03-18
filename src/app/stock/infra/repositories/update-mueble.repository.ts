import axiosInstance from "@/config/axios/axios.instance";
import type { Mueble } from "@/app/stock/dom/Mueble";
import type { UpdateMuebleDto } from "@/app/stock/dom/UpdateMuebleDto";
import type { UpdateMuebleRepositoryPort } from "@/app/stock/app/ports/output/update-mueble-repository.port";

export class UpdateMuebleRepository implements UpdateMuebleRepositoryPort {
  async update(id: string, data: UpdateMuebleDto): Promise<Mueble> {
    const response = await axiosInstance.put<Mueble>(`/api/catalogo-muebles/${id}`, data);
    return response.data;
  }
}

export const updateMuebleRepository = new UpdateMuebleRepository();
