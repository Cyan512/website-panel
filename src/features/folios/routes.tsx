import { lazy, type ComponentType } from "react";
import type { RouteConfig } from "@/app/routes";

const FoliosPage = lazy(() => import("./components/FoliosPage")) as ComponentType;

export const foliosRoutes: RouteConfig[] = [
  { path: "folios", element: <FoliosPage /> },
];
