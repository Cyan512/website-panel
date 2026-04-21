import { lazy, type ComponentType } from "react";
import type { RouteConfig } from "@/app/routes";

const InventoryPage = lazy(() => import("./components/InventoryPage")) as ComponentType;

export const inventoryRoutes: RouteConfig[] = [
  { path: "stock", element: <InventoryPage /> },
];
