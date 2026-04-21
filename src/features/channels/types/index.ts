export type TipoCanal = "OTA" | "DIRECTO" | "AGENTE";

export const tipoCanalLabels: Record<TipoCanal, string> = {
  OTA: "OTA",
  DIRECTO: "Directo",
  AGENTE: "Agente",
};

export const tipoCanalColors: Record<TipoCanal, string> = {
  OTA: "bg-info-bg text-info border border-info/20",
  DIRECTO: "bg-success-bg text-success border border-success/20",
  AGENTE: "bg-accent-primary/10 text-accent-primary border border-accent-primary/20",
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
