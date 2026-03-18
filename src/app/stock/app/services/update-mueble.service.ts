import type { Mueble } from "@/app/stock/dom/Mueble";
import type { UpdateMuebleDto } from "@/app/stock/dom/UpdateMuebleDto";
import type { UpdateMuebleUseCase } from "@/app/stock/app/ports/use-cases/update-mueble.use-case";
import { updateMuebleRepository } from "@/app/stock/infra/repositories/update-mueble.repository";

export class UpdateMuebleService implements UpdateMuebleUseCase {
  async execute(id: string, data: UpdateMuebleDto): Promise<Mueble> {
    if (!id) {
      throw new Error("El ID del mueble es requerido");
    }
    if (data.codigo && data.codigo.length > 30) {
      throw new Error("El código debe tener máximo 30 caracteres");
    }
    if (data.nombre && data.nombre.length > 100) {
      throw new Error("El nombre debe tener máximo 100 caracteres");
    }
    if (data.imagen_url && !this.isValidUrl(data.imagen_url)) {
      throw new Error("La URL de imagen no es válida");
    }
    if (data.tipo && data.tipo.length > 60) {
      throw new Error("El tipo debe tener máximo 60 caracteres");
    }
    return updateMuebleRepository.update(id, data);
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

export const updateMuebleService = new UpdateMuebleService();
