import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { authClient } from "@/shared/lib/auth";
import {
  MdDashboard,
  MdEventNote,
  MdPeople,
  MdMenu,
  MdClose,
  MdPayment,
  MdLocalOffer,
  MdHub,
  MdBedroomParent,
  MdChair,
  MdHotel,
  MdExpandMore,
  MdExpandLess,
  MdLogout,
  MdPerson,
  MdSettings,
  MdKeyboardArrowUp,
  MdShoppingCart,
  MdReceipt,
  MdLocalBar,
  MdKitchen,
} from "react-icons/md";
import { cn } from "@/shared/utils/cn";
import { useState, useRef, useEffect, type ComponentType } from "react";
import { sileo } from "sileo";

interface MenuItem {
  id: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  path: string;
  roles?: string[];
}

interface MenuGroup {
  id: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  paths: string[];
  children: MenuItem[];
  roles?: string[];
}

type NavItem = { kind: "link"; item: MenuItem } | { kind: "group"; group: MenuGroup } | { kind: "separator"; label: string };

const navItems: NavItem[] = [
  { kind: "separator", label: "Principal" },
  { kind: "link", item: { id: "dashboard", icon: MdDashboard, label: "Dashboard", path: "/dashboard" } },
  { kind: "separator", label: "Operación" },
  { kind: "link", item: { id: "booking", icon: MdEventNote, label: "Reservas", path: "/bookings" } },
  { kind: "link", item: { id: "rooms", icon: MdHotel, label: "Habitaciones", path: "/rooms", roles: ["ADMIN", "RECEPCIONISTA"] } },
  { kind: "link", item: { id: "client", icon: MdPeople, label: "Huéspedes", path: "/clients", roles: ["ADMIN", "RECEPCIONISTA"] } },
  { kind: "link", item: { id: "stays", icon: MdBedroomParent, label: "Estancias", path: "/stays", roles: ["ADMIN", "RECEPCIONISTA"] } },
  { kind: "separator", label: "Gestión" },
  { kind: "link", item: { id: "stock", icon: MdShoppingCart, label: "Inventario", path: "/stock", roles: ["ADMIN", "RECEPCIONISTA"] } },
  {
    kind: "group",
    group: {
      id: "payments-group",
      icon: MdPayment,
      label: "Pagos",
      paths: ["/payments", "/rates", "/channels"],
      roles: ["ADMIN", "RECEPCIONISTA"],
      children: [
        { id: "payments", icon: MdPayment, label: "Pagos", path: "/payments" },
        { id: "rates", icon: MdLocalOffer, label: "Tarifas", path: "/rates" },
        { id: "channels", icon: MdHub, label: "Canales", path: "/channels", roles: ["ADMIN", "RECEPCIONISTA"] },
      ],
    },
  },
  { kind: "link", item: { id: "furniture", icon: MdChair, label: "Muebles", path: "/furniture", roles: ["ADMIN", "RECEPCIONISTA"] } },
  { kind: "link", item: { id: "products", icon: MdShoppingCart, label: "Productos", path: "/products", roles: ["ADMIN", "RECEPCIONISTA"] } },
  { kind: "link", item: { id: "folios", icon: MdReceipt, label: "Folios", path: "/folios", roles: ["ADMIN", "RECEPCIONISTA"] } },
  { kind: "link", item: { id: "promotions", icon: MdLocalOffer, label: "Promociones", path: "/promotions", roles: ["ADMIN", "RECEPCIONISTA"] } },
  {
    kind: "group",
    group: {
      id: "insumos-group",
      icon: MdLocalBar,
      label: "Insumos",
      paths: ["/bar-supplies", "/kitchen-supplies"],
      roles: ["ADMIN", "RECEPCIONISTA"],
      children: [
        { id: "bar-supplies", icon: MdLocalBar, label: "Insumos Bar", path: "/bar-supplies", roles: ["ADMIN", "RECEPCIONISTA"] },
        { id: "kitchen-supplies", icon: MdKitchen, label: "Insumos Cocina", path: "/kitchen-supplies" },
      ],
    },
  },
];

function GroupItem({ group, userRole, onNavClick }: { group: MenuGroup; userRole: string; onNavClick: () => void }) {
  const location = useLocation();
  const isActive = group.paths.some((p) => location.pathname.startsWith(p));
  const [open, setOpen] = useState(isActive);

  if (group.roles && !group.roles.includes(userRole)) return null;

  const Icon = group.icon;

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg my-0.5 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none group relative overflow-hidden",
          isActive ? "text-accent-light bg-accent/10" : "text-text-secondary hover:bg-white/5 hover:text-text-primary",
        )}
        style={{ width: "calc(100% - 1rem)" }}
      >
        <span
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 rounded-full bg-accent-light transition-all duration-300",
            isActive && "h-5 rounded-full",
          )}
        />
        <Icon className={cn("w-5 h-5 shrink-0 transition-transform duration-300", !isActive && "group-hover:translate-x-0.5")} />
        <span className="text-sm font-medium flex-1 text-left" style={{ fontFamily: "var(--font-body)" }}>
          {group.label}
        </span>
        {open ? <MdExpandLess className="w-4 h-4 shrink-0" /> : <MdExpandMore className="w-4 h-4 shrink-0" />}
      </button>

      {open && (
        <div className="ml-4 border-l border-border pl-2 my-0.5">
          {group.children.map((child) => {
            const ChildIcon = child.icon;
            return (
              <NavLink
                key={child.id}
                to={child.path}
                onClick={onNavClick}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 mx-2 px-3 py-2 rounded-lg my-0.5 transition-all duration-300 relative overflow-hidden group",
                    isActive ? "text-accent-light bg-accent/10" : "text-text-secondary hover:bg-white/5 hover:text-text-primary",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 rounded-full bg-accent-light transition-all duration-300",
                        isActive && "h-4 rounded-full",
                      )}
                    />
                    <ChildIcon className={cn("w-4 h-4 transition-transform duration-300", !isActive && "group-hover:translate-x-0.5")} />
                    <span className="text-sm" style={{ fontFamily: "var(--font-body)" }}>
                      {child.label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { data: session } = authClient.useSession();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const userRole = session?.user?.role || "USER";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      navigate("/");
    } catch {
      sileo.error({ title: "Error", description: "No se pudo cerrar sesión" });
    }
  };

  const handleNavClick = () => setIsMobileOpen(false);

  return (
    <div className="min-h-screen">
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-bg-secondary border border-border shadow-lg"
        aria-label={isMobileOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {isMobileOpen ? <MdClose className="w-5 h-5 text-text-primary" /> : <MdMenu className="w-5 h-5 text-text-primary" />}
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
          "fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out bg-bg-secondary border-r border-border w-64 transform",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        )}
      >
        <div className="py-5 px-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 relative">
              <div className="absolute inset-0 rounded-xl ring-1 ring-accent/30 ring-offset-2 ring-offset-transparent" />
              <img src="/chakana_sin_fondo.svg" alt="Logo" className="w-full h-full object-cover drop-shadow-lg" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary" style={{ fontFamily: "var(--font-display)", letterSpacing: "0.06em" }}>
                Kori Hotel
              </h2>
              <p
                className="text-[10px] text-text-muted uppercase tracking-widest"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "0.14em" }}
              >
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((navItem, idx) => {
            if (navItem.kind === "separator") {
              return (
                <div key={`sep-${idx}`} className="px-4 pt-4 pb-1">
                  <p
                    className="text-[10px] font-semibold tracking-wider uppercase text-text-muted"
                    style={{ fontFamily: "var(--font-display)", letterSpacing: "0.14em" }}
                  >
                    {navItem.label}
                  </p>
                </div>
              );
            }
            if (navItem.kind === "link") {
              const { item } = navItem;
              if (item.roles && !item.roles.includes(userRole)) return null;
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg my-0.5 transition-all duration-300 relative overflow-hidden group",
                      isActive ? "text-accent-light bg-accent/10" : "text-text-secondary hover:bg-white/5 hover:text-text-primary",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={cn(
                          "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 rounded-full bg-accent-light transition-all duration-300",
                          isActive && "h-5 rounded-full",
                        )}
                      />
                      <Icon className={cn("w-5 h-5 transition-transform duration-300", !isActive && "group-hover:translate-x-0.5")} />
                      <span className="text-sm font-medium" style={{ fontFamily: "var(--font-body)" }}>
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            }
            return <GroupItem key={navItem.group.id} group={navItem.group} userRole={userRole} onNavClick={handleNavClick} />;
          })}
        </nav>

        <div className="p-4 border-t border-border shrink-0">
          <div ref={profileRef} className="relative">
            {isProfileOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-text-primary truncate">{session?.user?.name || "Usuario"}</p>
                  <p className="text-xs text-text-muted truncate">{session?.user?.email || ""}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors"
                  >
                    <MdPerson className="w-4 h-4 shrink-0" />
                    Mi perfil
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate("/settings");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-bg-hover hover:text-text-primary transition-colors"
                  >
                    <MdSettings className="w-4 h-4 shrink-0" />
                    Configuración
                  </button>
                </div>
                <div className="py-1 border-t border-border">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors"
                  >
                    <MdLogout className="w-4 h-4 shrink-0" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setIsProfileOpen((o) => !o)}
              className={cn(
                "w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all",
                isProfileOpen ? "bg-bg-hover border-border-light" : "bg-bg-tertiary/30 border-border hover:bg-bg-hover",
              )}
            >
              <div className="w-9 h-9 shrink-0 rounded-lg overflow-hidden border border-border">
                <img
                  src={session?.user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.name || "default"}`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-text-primary truncate">{session?.user?.name || "Usuario"}</p>
                <p className="text-[10px] text-text-muted">{session?.user?.role || "Sin rol"}</p>
              </div>
              <MdKeyboardArrowUp className={cn("w-4 h-4 text-text-muted shrink-0 transition-transform", isProfileOpen ? "rotate-0" : "rotate-180")} />
            </button>
          </div>
        </div>
      </aside>

      <div className={cn("min-h-screen transition-all duration-300", "lg:ml-64")}>
        <div className="p-4 sm:p-6 lg:p-8 pb-16">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
