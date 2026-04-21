import { lazy, type ComponentType } from "react";
import type { RouteConfig } from "@/app/routes";

const CanalesPage = lazy(() => import("./components/CanalesPage")) as ComponentType;

export const channelsRoutes: RouteConfig[] = [
  { path: "channels", element: <CanalesPage /> },
];
