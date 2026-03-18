import type { Mueble } from "@/app/stock/dom/Mueble";

export interface GetMueblesUseCase {
  execute(): Promise<Mueble[]>;
}
