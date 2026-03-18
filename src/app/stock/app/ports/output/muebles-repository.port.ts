import type { Mueble } from "@/app/stock/dom/Mueble";

export interface MueblesRepositoryPort {
  getAll(): Promise<Mueble[]>;
}
