import { lazy, type ComponentType } from "react";
import type { RouteConfig } from "@/app/routes";

const ProfilePage = lazy(() => import("./components/ProfilePage")) as ComponentType;

export const profileRoutes: RouteConfig[] = [
  { path: "profile", element: <ProfilePage /> },
];
