import { lazy, type ComponentType } from "react";
import type { RouteConfig } from "@/app/routes";

const PromocionesPage = lazy(() => import("./components/PromocionesPage")) as ComponentType;

export const promotionsRoutes: RouteConfig[] = [
  { path: "promotions", element: <PromocionesPage /> },
];
