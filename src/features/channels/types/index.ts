export type TipoCanal = "OTA" | "DIRECTO" | "AGENTE";

export const tipoCanalLabels: Record<TipoCanal, string> = {
  OTA: "OTA",
  DIRECTO: "Directo",
  AGENTE: "Agente",
};

export const tipoCanalColors: Record<TipoCanal, string> = {
  OTA: "bg-blue-100 text-blue-700",
  DIRECTO: "bg-emerald-100 text-emerald-700",
  AGENTE: "bg-purple-100 text-purple-700",
};

export interface CanalOutput {
  id: string;
  nombre: string;
  tipo: TipoCanal;
  activo: boolean;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCanalInput {
  nombre: string;
  tipo: TipoCanal;
  activo?: boolean;
  notas?: string;
}

export interface UpdateCanalInput {
  nombre?: string;
  tipo?: TipoCanal;
  activo?: boolean;
  notas?: string;
}
