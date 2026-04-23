import { lazy, type ComponentType } from "react";
import type { RouteConfig } from "@/app/routes";

const RoomsPage = lazy(() => import("./components/RoomsPage")) as ComponentType;
const RoomDetailPage = lazy(() => import("./components/RoomDetailPage")) as ComponentType;
const TipoHabitacionPage = lazy(() => import("./components/TipoHabitacionPage")) as ComponentType;

export const roomsRoutes: RouteConfig[] = [
  { path: "rooms", element: <RoomsPage /> },
  { path: "rooms/:id", element: <RoomDetailPage /> },
  { path: "room-types", element: <TipoHabitacionPage /> },
];
