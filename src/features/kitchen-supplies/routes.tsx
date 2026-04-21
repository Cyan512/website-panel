import { lazy, type ComponentType } from "react";
import type { RouteConfig } from "@/app/routes";

const InsumosCocinaPage = lazy(() => import("./components/InsumosCocinaPage")) as ComponentType;

export const kitchenSuppliesRoutes: RouteConfig[] = [
  { path: "kitchen-supplies", element: <InsumosCocinaPage /> },
];
