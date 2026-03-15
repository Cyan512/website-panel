export const HabitationType = {
  EstandarSimple: "ESTÁNDAR SIMPLE",
  EstandarDoble: "ESTÁNDAR DOBLE",
  Suite: "SUITE",
  SuiteJunior: "SUITE JUNIOR",
} as const;

export type HabitationType =
  (typeof HabitationType)[keyof typeof HabitationType];