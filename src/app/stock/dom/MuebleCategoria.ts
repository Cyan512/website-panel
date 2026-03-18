export const MuebleCategoria = {
  CAMA: "CAMA",
  ASIENTO: "ASIENTO",
  ALMACENAJE: "ALMACENAJE",
  TECNOLOGIA: "TECNOLOGIA",
  BANO: "BANO",
  DECORACION: "DECORACION",
  OTRO: "OTRO",
} as const;

export type MuebleCategoria =
  (typeof MuebleCategoria)[keyof typeof MuebleCategoria];
