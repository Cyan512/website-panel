import { lazy, type ComponentType } from "react";
import type { RouteConfig } from "@/app/routes";

const MueblesPage = lazy(() => import("./components/MueblesPage")) as ComponentType;

export const furnitureRoutes: RouteConfig[] = [
  { path: "furniture", element: <MueblesPage /> },
];
