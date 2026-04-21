import { lazy, type ComponentType } from "react";
import type { RouteConfig } from "@/app/routes";

const ClientsPage = lazy(() => import("./components/ClientsPage")) as ComponentType;

export const clientsRoutes: RouteConfig[] = [
  { path: "clients", element: <ClientsPage /> },
];
