import { lazy, type ComponentType } from "react";
import type { RouteConfig } from "@/app/routes";

const EstanciasPage = lazy(() => import("./components/EstanciasPage")) as ComponentType;

export const staysRoutes: RouteConfig[] = [
  { path: "stays", element: <EstanciasPage /> },
];
