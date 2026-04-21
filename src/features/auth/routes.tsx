import { lazy, type ComponentType } from "react";
import type { RouteConfig } from "@/app/routes";
import { AuthGuard } from "./components/AuthGuard";

const AuthPage = lazy(() => import("./components/AuthPage")) as ComponentType;

export const authRoutes: RouteConfig[] = [
  {
    path: "/",
    element: (
      <AuthGuard>
        <AuthPage />
      </AuthGuard>
    ),
  },
];
