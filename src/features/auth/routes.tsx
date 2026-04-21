import { lazy, type ComponentType } from "react";
import type { RouteConfig } from "@/app/routes";

const AuthPage = lazy(() => import("./components/AuthPage")) as ComponentType;

export const authRoutes: RouteConfig[] = [
  { path: "/", element: <AuthPage /> },
];
