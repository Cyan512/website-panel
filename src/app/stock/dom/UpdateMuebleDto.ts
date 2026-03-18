import type { MuebleCategoria } from "@/app/stock/dom/MuebleCategoria";
import type { MuebleCondicion } from "@/app/stock/dom/MuebleCondicion";

export interface UpdateMuebleDto {
  codigo?: string;
  nombre?: string;
  categoria?: MuebleCategoria;
  imagen_url?: string | null;
  tipo?: string | null;
  condicion?: MuebleCondicion;
  fecha_adquisicion?: string | null;
  ultima_revision?: string | null;
  descripcion?: string | null;
}
