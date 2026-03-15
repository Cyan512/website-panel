import * as React from "react";
import { lazy } from "react";
import { Navigate } from "react-router-dom";

import { ROUTES } from "@/utils/routes.utils";
import Sidebar from "@/app/admin/ui/sidebar";

export interface RouteConfig {
    path: string;
    element: React.ReactNode;
    children?: RouteConfig[];
}

const AuthPage = lazy(() => import("@/app/auth/ui/auth-page"));
const DashboardPage = lazy(() => import("@/app/admin/ui/dashboard-page"));
const ReservationsPage = lazy(() => import("@/app/reservations/ui/reservations-page"));
const RoomPage = lazy(() => import("@/app/room/ui/room-page"));
const ClientsPage = lazy(() => import("@/app/clients/ui/clients-page"));

export const routes: RouteConfig[] = [
    {
        path: "/",
        element: <AuthPage />,
    },

    {
        path: "/",
        element: <Sidebar />,
        children: [
            {
                path: ROUTES.DASHBOARD,
                element: <DashboardPage />,
            },
            {
                path: ROUTES.BOOKINGS,
                element: <ReservationsPage />,
            },
            {
                path: ROUTES.ROOMS,
                element: <RoomPage />,
            },
            {
                path: ROUTES.CLIENTS,
                element: <ClientsPage />,
            },
        ],
    },

    {
        path: "*",
        element: <Navigate to="/" replace />,
    },
];