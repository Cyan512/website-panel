import { lazy, type ComponentType } from "react";
import type { RouteConfig } from "@/app/routes";

const DashboardPage = lazy(() => import("./components/DashboardPage")) as ComponentType;

export const dashboardRoutes: RouteConfig[] = [
  { path: "dashboard", element: <DashboardPage /> },
];
