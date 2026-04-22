import { lazy, type ComponentType } from "react";
import type { RouteConfig } from "@/app/routes";

const TiposHabitacionPage = lazy(() => import("./components/TiposHabitacionPage")) as ComponentType;

export const roomTypesRoutes: RouteConfig[] = [
  { path: "room-types", element: <TiposHabitacionPage /> },
];
