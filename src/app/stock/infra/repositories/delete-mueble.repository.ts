import axiosInstance from "@/config/axios/axios.instance";
import type { DeleteMuebleRepositoryPort } from "@/app/stock/app/ports/output/delete-mueble-repository.port";

export class DeleteMuebleRepository implements DeleteMuebleRepositoryPort {
  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/api/catalogo-muebles/${id}`);
  }
}

export const deleteMuebleRepository = new DeleteMuebleRepository();
