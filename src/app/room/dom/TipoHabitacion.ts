import type { Mueble } from "@/app/stock/dom/Mueble";

export interface TipoHabitacion {
  id: string;
  nombre: string;
  descripcion: string | null;
  tiene_ducha: boolean;
  tiene_banio: boolean;
  muebles: Mueble[];
  created_at: Date;
  updated_at: Date;
}
