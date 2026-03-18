import type { Mueble } from "@/app/stock/dom/Mueble";

export interface GetMuebleUseCase {
  execute(id: string): Promise<Mueble>;
}
