import type { Mueble } from "@/app/stock/dom/Mueble";
import type { CreateMuebleDto } from "@/app/stock/dom/CreateMuebleDto";

export interface CreateMuebleUseCase {
  execute(data: CreateMuebleDto): Promise<Mueble>;
}
