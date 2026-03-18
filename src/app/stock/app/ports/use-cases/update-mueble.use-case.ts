import type { Mueble } from "@/app/stock/dom/Mueble";
import type { UpdateMuebleDto } from "@/app/stock/dom/UpdateMuebleDto";

export interface UpdateMuebleUseCase {
  execute(id: string, data: UpdateMuebleDto): Promise<Mueble>;
}
