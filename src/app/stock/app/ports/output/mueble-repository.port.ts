import type { Mueble } from "@/app/stock/dom/Mueble";

export interface MuebleRepositoryPort {
  getById(id: string): Promise<Mueble>;
}
