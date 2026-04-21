import { lazy, type ComponentType } from "react";
import type { RouteConfig } from "@/app/routes";

const InsumosBarPage = lazy(() => import("./components/InsumosBarPage")) as ComponentType;

export const barSuppliesRoutes: RouteConfig[] = [
  { path: "bar-supplies", element: <InsumosBarPage /> },
];
