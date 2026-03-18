import type { Mueble } from "@/app/stock/dom/Mueble";
import type { GetMueblesUseCase } from "@/app/stock/app/ports/use-cases/get-muebles.use-case";
import { getMueblesRepository } from "@/app/stock/infra/repositories/get-muebles.repository";

export class GetMueblesService implements GetMueblesUseCase {
  async execute(): Promise<Mueble[]> {
    return getMueblesRepository.getAll();
  }
}

export const getMueblesService = new GetMueblesService();
