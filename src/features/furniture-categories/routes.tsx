import { lazy, type ComponentType } from "react";
import type { RouteConfig } from "@/app/routes";

const CategoriasMueblePage = lazy(() => import("./components/CategoriasMueblePage")) as ComponentType;

export const furnitureCategoriesRoutes: RouteConfig[] = [
  { path: "furniture-categories", element: <CategoriasMueblePage /> },
];
