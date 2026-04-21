import { lazy, type ComponentType } from "react";
import type { RouteConfig } from "@/app/routes";

const ProductosPage = lazy(() => import("./components/ProductosPage")) as ComponentType;

export const productsRoutes: RouteConfig[] = [
  { path: "products", element: <ProductosPage /> },
];
