import { lazy, type ComponentType } from "react";
import type { RouteConfig } from "@/app/routes";

const TarifasPage = lazy(() => import("./components/TarifasPage")) as ComponentType;

export const ratesRoutes: RouteConfig[] = [
  { path: "rates", element: <TarifasPage /> },
];
