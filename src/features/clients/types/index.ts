export const NivelVip = {
  NORMAL: 0,
  VIP: 1,
  VVIP: 2,
} as const;

export type NivelVip = (typeof NivelVip)[keyof typeof NivelVip];

export const nivelVipLabels: Record<NivelVip, string> = {
  [NivelVip.NORMAL]: "Normal",
  [NivelVip.VIP]: "VIP",
  [NivelVip.VVIP]: "VVIP",
};

export interface Huesped {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  nacionalidad: string;
  nivel_vip: NivelVip;
  notas: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateHuespedDto {
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  nacionalidad: string;
  nivel_vip?: NivelVip;
  notas?: string | null;
}

export interface UpdateHuespedDto {
  nombres?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  nacionalidad?: string;
  nivel_vip?: NivelVip;
  notas?: string | null;
}
