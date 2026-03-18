import { ROUTES } from "@/utils/routes.utils";
import { NavLink, Outlet } from "react-router-dom";
import { authClient } from "@/config/authClient";
import { formatTime } from "@/utils/format.utils";

import { MdDashboard, MdEventNote, MdHotel, MdPeople, MdInventory, MdMenu, MdClose } from "react-icons/md";
import { cn } from "@/utils/cn";
import { useState, type ComponentType } from "react";

interface MenuItem {
  id: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  path: string;
  roles?: string[];
}

interface MenuSection {
  section: string;
  items: MenuItem[];
}

const menuItems: MenuSection[] = [
  {
    section: "Principal",
    items: [
      {
        id: "dashboard",
        icon: MdDashboard,
        label: "Dashboard",
        path: ROUTES.DASHBOARD,
      },
      {
        id: "booking",
        icon: MdEventNote,
        label: "Reservas",
        path: ROUTES.BOOKINGS,
      },
      { id: "room", icon: MdHotel, label: "Habitaciones", path: ROUTES.ROOMS },
      {
        id: "client",
        icon: MdPeople,
        label: "Huéspedes",
        path: ROUTES.CLIENTS,
        roles: ["ADMIN"],
      },
      {
        id: "stock",
        icon: MdInventory,
        label: "Inventario",
        path: ROUTES.STOCK,
        roles: ["ADMIN"],
      },
    ],
  },
];

export default function Sidebar() {
  const { data: session } = authClient.useSession();
  const isOpen = true;
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const userRole = session?.user?.role || "USER";

  const filteredItems = menuItems.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) => !item.roles || item.roles.includes(userRole)
    ),
  }));

  return (
    <div className="min-h-screen">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-paper-dark/90 backdrop-blur-md border border-border-light shadow-lg"
      >
        {isMobileOpen ? (
          <MdClose className="w-6 h-6 text-text-dark" />
        ) : (
          <MdMenu className="w-6 h-6 text-text-dark" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ease-out",
          "bg-gradient-to-b from-paper-light to-paper-light/95 backdrop-blur-xl",
          "border-r border-border-light/50 shadow-2xl shadow-black/10",
          "w-72",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="py-6 px-5 border-b border-border-light/30 shrink-0">
          <div className="relative">
            <img src="/kori-logo.webp" alt="" className="mx-auto h-14 drop-shadow-lg" />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-20 h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent" />
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-4 overflow-y-auto relative z-10">
          {filteredItems.map((section) => (
            <div key={section.section}>
              <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-text-muted/60 px-5 py-3">
                {section.section}
              </div>
              {section.items.map((menuItem) => {
                const Icon = menuItem.icon;
                return (
                  <NavLink
                    key={menuItem.id}
                    to={menuItem.path}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {({ isActive }) => (
                      <div
                        className={cn(
                          "group relative flex items-center gap-3 mx-3 px-4 py-3 rounded-xl mx-2 my-0.5 cursor-pointer transition-all duration-200",
                          isActive
                            ? "bg-gradient-to-r from-accent-primary/10 to-accent-light/10 border-l-4 border-accent-primary"
                            : "hover:bg-paper-medium/30 border-l-4 border-transparent"
                        )}
                      >
                        {/* Active indicator */}
                        <div
                          className={cn(
                            "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full transition-all duration-300",
                            isActive
                              ? "bg-gradient-to-b from-accent-light to-accent-primary opacity-100"
                              : "opacity-0 group-hover:opacity-50"
                          )}
                        />

                        {/* Icon */}
                        <div
                          className={cn(
                            "p-2 rounded-lg transition-all duration-300",
                            isActive
                              ? "bg-accent-primary/20 text-accent-primary"
                              : "bg-paper-medium/50 text-text-muted group-hover:bg-paper-dark/50 group-hover:text-text-secondary"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Label */}
                        <span
                          className={cn(
                            "font-medium transition-colors duration-200",
                            isActive
                              ? "text-text-darkest font-semibold"
                              : "text-text-secondary group-hover:text-text-dark"
                          )}
                        >
                          {menuItem.label}
                        </span>

                        {/* Active glow */}
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 to-transparent rounded-xl pointer-events-none" />
                        )}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border-light/30 shrink-0">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-paper-medium/20 mb-3">
            <div className="w-11 h-11 shrink-0 rounded-xl overflow-hidden border-2 border-brand/30 shadow-lg">
              <img
                src={
                  session?.user?.image ||
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
                }
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-text-dark truncate">
                {session?.user.name || "Usuario"}
              </div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-brand/10 text-brand">
                {session?.user.role || "Sin rol"}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-text-muted/60 px-1">
            <span className="font-medium">Sesión:</span>
            <span>
              {session?.session
                ? formatTime(session.session.createdAt)
                : "Sin sesión"}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={cn(
          "min-h-screen transition-all duration-300 ease-out",
          "lg:ml-72"
        )}
      >
        <div className="p-4 sm:p-6 lg:p-8 pb-16">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
