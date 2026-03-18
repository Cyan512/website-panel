export const MuebleCondicion = {
  BUENO: "BUENO",
  REGULAR: "REGULAR",
  DANADO: "DANADO",
  FALTANTE: "FALTANTE",
} as const;

export type MuebleCondicion =
  (typeof MuebleCondicion)[keyof typeof MuebleCondicion];
