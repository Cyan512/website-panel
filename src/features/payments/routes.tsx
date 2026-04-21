import { lazy, type ComponentType } from "react";
import type { RouteConfig } from "@/app/routes";

const PagosPage = lazy(() => import("./components/PagosPage")) as ComponentType;

export const paymentsRoutes: RouteConfig[] = [
  { path: "payments", element: <PagosPage /> },
];
