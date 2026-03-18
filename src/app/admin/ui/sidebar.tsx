import { ROUTES } from "@/utils/routes.utils";
import { NavLink, Outlet } from "react-router-dom";
import { authClient } from "@/config/authClient";
import { formatTime } from "@/utils/format.utils";

import { MdDashboard, MdEventNote, MdHotel, MdPeople, MdInventory, MdMenu, MdClose, MdOutlineSpa } from "react-icons/md";
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
      { id: "room-types", icon: MdHotel, label: "Tipos de Habitación", path: "/room-types" },
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
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const userRole = session?.user?.role || "USER";

  const filteredItems = menuItems.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) => !item.roles || item.roles.includes(userRole)
    ),
  }));

  const handleNavClick = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className="min-h-screen">
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-bg-secondary border border-border shadow-lg"
        aria-label={isMobileOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {isMobileOpen ? (
          <MdClose className="w-5 h-5 text-text-primary" />
        ) : (
          <MdMenu className="w-5 h-5 text-text-primary" />
        )}
      </button>

      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={handleNavClick}
          onKeyDown={(e) => e.key === "Escape" && handleNavClick()}
          role="button"
          tabIndex={0}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out",
          "bg-bg-secondary border-r border-border",
          "w-64",
          "transform",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        <div className="py-5 px-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <MdOutlineSpa className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">Kori Hotel</h2>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {filteredItems.map((section) => (
            <div key={section.section}>
              <div className="text-[10px] font-semibold tracking-wider uppercase text-text-muted px-4 py-2">
                {section.section}
              </div>
              {section.items.map((menuItem) => {
                const Icon = menuItem.icon;
                return (
                  <NavLink
                    key={menuItem.id}
                    to={menuItem.path}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg my-0.5 cursor-pointer transition-all duration-200",
                        isActive
                          ? "bg-primary text-white"
                          : "text-text-secondary hover:bg-bg-hover hover:text-text-primary"
                      )
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      {menuItem.label}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-border shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-bg-tertiary/50 mb-3">
            <div className="w-9 h-9 shrink-0 rounded-lg overflow-hidden border border-border">
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
              <div className="text-sm font-medium text-text-primary truncate">
                {session?.user.name || "Usuario"}
              </div>
              <div className="text-[10px] text-text-muted">
                {session?.user.role || "Sin rol"}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-text-muted px-1">
            <span>Sesión:</span>
            <span>
              {session?.session
                ? formatTime(session.session.createdAt)
                : "Sin sesión"}
            </span>
          </div>
        </div>
      </aside>

      <div
        className={cn(
          "min-h-screen transition-all duration-300",
          "lg:ml-64"
        )}
      >
        <div className="p-4 sm:p-6 lg:p-8 pb-16">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
