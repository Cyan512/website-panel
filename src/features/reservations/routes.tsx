import { lazy, type ComponentType } from "react";
import type { RouteConfig } from "@/app/routes";

const ReservationsPage = lazy(() => import("./components/ReservationsPage")) as ComponentType;

export const reservationsRoutes: RouteConfig[] = [
  { path: "bookings", element: <ReservationsPage /> },
];
