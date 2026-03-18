import type { Mueble } from "@/app/stock/dom/Mueble";
import type { UpdateMuebleDto } from "@/app/stock/dom/UpdateMuebleDto";

export interface UpdateMuebleRepositoryPort {
  update(id: string, data: UpdateMuebleDto): Promise<Mueble>;
}
