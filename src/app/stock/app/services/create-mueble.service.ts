import type { Mueble } from "@/app/stock/dom/Mueble";
import type { CreateMuebleDto } from "@/app/stock/dom/CreateMuebleDto";
import type { CreateMuebleUseCase } from "@/app/stock/app/ports/use-cases/create-mueble.use-case";
import { createMuebleRepository } from "@/app/stock/infra/repositories/create-mueble.repository";

export class CreateMuebleService implements CreateMuebleUseCase {
  async execute(data: CreateMuebleDto): Promise<Mueble> {
    if (!data.codigo || !data.nombre || !data.categoria) {
      throw new Error("Código, nombre y categoría son requeridos");
    }
    if (data.codigo.length > 30) {
      throw new Error("El código debe tener máximo 30 caracteres");
    }
    if (data.nombre.length > 100) {
      throw new Error("El nombre debe tener máximo 100 caracteres");
    }
    if (data.imagen_url && !this.isValidUrl(data.imagen_url)) {
      throw new Error("La URL de imagen no es válida");
    }
    if (data.tipo && data.tipo.length > 60) {
      throw new Error("El tipo debe tener máximo 60 caracteres");
    }
    return createMuebleRepository.create(data);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

export const createMuebleService = new CreateMuebleService();
