import * as React from "react";
import { lazy, type ComponentType } from "react";
import { Navigate } from "react-router-dom";

import Sidebar from "@/layout/Sidebar";

/* eslint-disable react-refresh/only-export-components */
export interface RouteConfig {
    path: string;
    element: React.ReactNode;
    children?: RouteConfig[];
}

const AuthPage = lazy(() => import("@/features/auth/components/AuthPage")) as ComponentType;
const DashboardPage = lazy(() => import("@/features/dashboard/components/DashboardPage")) as ComponentType;
const ReservationsPage = lazy(() => import("@/features/reservations/components/ReservationsPage")) as ComponentType;
const RoomsPage = lazy(() => import("@/features/rooms/components/RoomsPage")) as ComponentType;
const TipoHabitacionPage = lazy(() => import("@/features/rooms/components/TipoHabitacionPage")) as ComponentType;
const ClientsPage = lazy(() => import("@/features/clients/components/ClientsPage")) as ComponentType;
const InventoryPage = lazy(() => import("@/features/inventory/components/InventoryPage")) as ComponentType;

const protectedRoutes: RouteConfig[] = [
    { path: "dashboard", element: <DashboardPage /> },
    { path: "bookings", element: <ReservationsPage /> },
    { path: "rooms", element: <RoomsPage /> },
    { path: "room-types", element: <TipoHabitacionPage /> },
    { path: "clients", element: <ClientsPage /> },
    { path: "stock", element: <InventoryPage /> },
];

export const routes: RouteConfig[] = [
    { path: "/", element: <AuthPage /> },
    { path: "/app", element: <Sidebar />, children: protectedRoutes },
    { path: "*", element: <Navigate to="/" replace /> },
];
/* eslint-enable react-refresh/only-export-components */
