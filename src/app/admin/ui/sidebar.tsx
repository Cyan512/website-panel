import { ROUTES } from "@/utils/routes.utils";
import { NavLink, Outlet } from "react-router-dom";
import { authClient } from "@/config/authClient";
import { formatTime } from "@/utils/format.utils";

import { MdDashboard, MdEventNote, MdHotel, MdPeople } from "react-icons/md";
import { cn } from "@/utils/cn";
import { useState } from "react";

const menuItems = [
    {
        section: 'Principal',
        items: [
            { id: 'dashboard', icon: MdDashboard, label: 'Dashboard', path: ROUTES.DASHBOARD },
            { id: 'booking', icon: MdEventNote, label: 'Reservas', path: ROUTES.BOOKINGS },
            { id: 'room', icon: MdHotel, label: 'Habitaciones', path: ROUTES.ROOMS },
            { id: 'client', icon: MdPeople, label: 'Huéspedes', path: ROUTES.CLIENTS },
        ]
    }
]

export default function Sidebar() {
    const { data: session } = authClient.useSession()
    const [isOpen] = useState(true);

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <div className={cn("fixed lg:relative z-20 h-full w-72 lg:w-80 flex flex-col",
                isOpen
                    ? "translate-x-0'"
                    : "-translate-x-full lg:translate-x-0"
            )}>
                {/* Header */}
                <div>

                </div>
                {/* Menu Items */}
                <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                    {menuItems.map((section) => (
                        <div>
                            <span>
                                {section.section}
                            </span>
                            {section.items.map((menuItem) => {
                                const Icon = menuItem.icon;
                                return (
                                    <NavLink key={menuItem.id} to={menuItem.path}>
                                        {({ isActive }) => (
                                            <div className="w-full flex items-center space-x-3 px-3 py-3 rounded transition-all group">
                                                <Icon className={cn(
                                                    "w-5 h-5 shrink-0",
                                                    isActive
                                                        ? ""
                                                        : ""
                                                )} />
                                                <span className="flex-1 text-left text-sm truncate">
                                                    {menuItem.label}
                                                </span>
                                            </div>
                                        )}
                                    </NavLink>
                                )
                            })}
                        </div>
                    ))}
                </nav>
                {/* Footer */}
                <div className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 shrink-0 flex items-center justify-center">
                            <img src={session?.user?.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"} alt="" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate">
                                {session?.user.name || "Usuario"}
                            </div>
                            <div className="text-xs truncate">
                                {session?.user.email || "Sin correo"}
                            </div>
                        </div>
                    </div>
                    <div className="text-xs flex items-center justify-between">
                        <span>
                            Session:
                        </span>
                        <span>{session?.session ? formatTime(session.session.createdAt) : "Sin sesión"}</span>
                    </div>
                </div>
            </div>
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="flex-1 p-4 lg:p-8 overflow-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    )

}
