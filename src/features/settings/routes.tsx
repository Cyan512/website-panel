import { lazy, type ComponentType } from "react";
import type { RouteConfig } from "@/app/routes";

const SettingsPage = lazy(() => import("./components/SettingsPage")) as ComponentType;

export const settingsRoutes: RouteConfig[] = [
  { path: "settings", element: <SettingsPage /> },
];
