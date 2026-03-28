export type TipoCanal = "OTA" | "DIRECTO" | "AGENTE";

export const tipoCanalLabels: Record<TipoCanal, string> = {
  OTA: "OTA",
  DIRECTO: "Directo",
  AGENTE: "Agente",
};

export const tipoCanalColors: Record<TipoCanal, string> = {
  OTA: "bg-blue-500 text-blue-100",
  DIRECTO: "bg-emerald-500 text-emerald-100",
  AGENTE: "bg-purple-500 text-purple-100",
};

export interface Canal {
  id: string;
  nombre: string;
  tipo: TipoCanal;
  activo: boolean;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCanal {
  nombre: string;
  tipo: TipoCanal;
  activo?: boolean;
  notas?: string;
}

export interface UpdateCanal {
  nombre?: string;
  tipo?: TipoCanal;
  activo?: boolean;
  notas?: string;
}
