import { useState } from "react";
import { authClient } from "@/shared/lib/auth";
import { PanelHeader, Button } from "@/components";
import { sileo } from "sileo";
import { MdLock, MdPalette, MdLanguage, MdNotifications, MdCheck } from "react-icons/md";
import { cn } from "@/shared/utils/cn";

const ACCENT_COLORS = [
  { label: "Azul", value: "#3a6baf" },
  { label: "Dorado", value: "#c9a227" },
  { label: "Verde", value: "#4a8c5c" },
  { label: "Rojo", value: "#8b1e2d" },
  { label: "Índigo", value: "#4f46e5" },
  { label: "Teal", value: "#0d9488" },
];

export default function SettingsPage() {
  const [changingPassword, setChangingPassword] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [savingPw, setSavingPw] = useState(false);
  const [accentColor, setAccentColor] = useState(() => getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim() || "#3a6baf");
  const [notifications, setNotifications] = useState(true);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) return sileo.error({ title: "Error", description: "Las contraseñas no coinciden" });
    if (pwForm.next.length < 8) return sileo.error({ title: "Error", description: "La contraseña debe tener al menos 8 caracteres" });

    setSavingPw(true);
    try {
      await authClient.changePassword({ currentPassword: pwForm.current, newPassword: pwForm.next, revokeOtherSessions: false });
      sileo.success({ title: "Contraseña actualizada" });
      setPwForm({ current: "", next: "", confirm: "" });
      setChangingPassword(false);
    } catch {
      sileo.error({ title: "Error", description: "Contraseña actual incorrecta o error del servidor" });
    } finally {
      setSavingPw(false);
    }
  };

  const applyAccent = (color: string) => {
    document.documentElement.style.setProperty("--color-primary", color);
    setAccentColor(color);
    sileo.success({ title: "Color aplicado", description: "El cambio es temporal hasta recargar la página" });
  };

  const inputClass = "w-full bg-bg-tertiary/50 border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <PanelHeader title="Configuración" subtitle="Preferencias de tu cuenta">
      <div className="p-4 sm:p-6 space-y-6 max-w-xl">

        {/* Password */}
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <MdLock className="w-4 h-4 text-text-muted" />
              <span className="text-sm font-medium text-text-primary">Contraseña</span>
            </div>
            {!changingPassword && (
              <button onClick={() => setChangingPassword(true)} className="text-xs text-primary hover:text-primary/80 transition-colors">
                Cambiar
              </button>
            )}
          </div>

          {changingPassword ? (
            <form onSubmit={handleChangePassword} className="p-4 space-y-3">
              <input type="password" placeholder="Contraseña actual" value={pwForm.current} onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))} className={inputClass} required />
              <input type="password" placeholder="Nueva contraseña" value={pwForm.next} onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))} className={inputClass} required />
              <input type="password" placeholder="Confirmar nueva contraseña" value={pwForm.confirm} onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))} className={inputClass} required />
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="secondary" onClick={() => { setChangingPassword(false); setPwForm({ current: "", next: "", confirm: "" }); }} className="flex-1">Cancelar</Button>
                <Button type="submit" isLoading={savingPw} className="flex-1">{savingPw ? "Guardando..." : "Actualizar"}</Button>
              </div>
            </form>
          ) : (
            <div className="px-4 py-3">
              <p className="text-sm text-text-muted">••••••••••••</p>
            </div>
          )}
        </div>

        {/* Accent color */}
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <MdPalette className="w-4 h-4 text-text-muted" />
            <span className="text-sm font-medium text-text-primary">Color de acento</span>
            <span className="text-xs text-text-muted ml-auto">Temporal (hasta recargar)</span>
          </div>
          <div className="p-4 flex gap-3 flex-wrap">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => applyAccent(c.value)}
                title={c.label}
                className={cn("w-9 h-9 rounded-xl border-2 transition-all flex items-center justify-center", accentColor === c.value ? "border-text-primary scale-110" : "border-transparent hover:scale-105")}
                style={{ backgroundColor: c.value }}
              >
                {accentColor === c.value && <MdCheck className="w-4 h-4 text-white drop-shadow" />}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <MdLanguage className="w-4 h-4 text-text-muted" />
            <span className="text-sm font-medium text-text-primary">Idioma</span>
          </div>
          <div className="px-4 py-3">
            <select className="w-full bg-bg-tertiary/50 border border-border rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <MdNotifications className="w-4 h-4 text-text-muted" />
            <span className="text-sm font-medium text-text-primary">Notificaciones</span>
          </div>
          <div className="px-4 py-3 space-y-3">
            {[
              { label: "Notificaciones del sistema", key: "system" },
              { label: "Alertas de reservas", key: "reservas" },
              { label: "Recordatorios de limpieza", key: "limpieza" },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-text-secondary">{item.label}</span>
                <div
                  onClick={() => setNotifications((n) => !n)}
                  className={cn("w-10 h-5 rounded-full transition-colors relative", notifications ? "bg-primary" : "bg-bg-tertiary")}
                >
                  <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform", notifications ? "translate-x-5" : "translate-x-0.5")} />
                </div>
              </label>
            ))}
          </div>
        </div>

      </div>
    </PanelHeader>
  );
}
