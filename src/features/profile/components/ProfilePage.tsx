import { useState } from "react";
import { authClient } from "@/shared/lib/auth";
import { PanelHeader } from "@/components";
import { sileo } from "sileo";
import { MdPerson, MdEmail, MdBadge, MdEdit, MdCheck, MdClose } from "react-icons/md";

export default function ProfilePage() {
  const { data: session, refetch } = authClient.useSession();
  const user = session?.user;

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return sileo.error({ title: "Error", description: "El nombre no puede estar vacío" });
    setSaving(true);
    try {
      await authClient.updateUser({ name: name.trim() });
      await refetch();
      sileo.success({ title: "Perfil actualizado" });
      setEditing(false);
    } catch {
      sileo.error({ title: "Error", description: "No se pudo actualizar el perfil" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name ?? "");
    setEditing(false);
  };

  return (
    <PanelHeader title="Mi Perfil" subtitle="Información de tu cuenta">
      <div className="p-4 sm:p-6 space-y-6 max-w-xl">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-border shrink-0">
            <img
              src={user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "default"}`}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-xl font-bold text-text-primary">{user?.name}</p>
            <span className="inline-block mt-1 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
              {user?.role || "Usuario"}
            </span>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          {/* Name */}
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 text-text-muted text-xs">
                <MdPerson className="w-4 h-4" />
                Nombre
              </div>
              {!editing && (
                <button onClick={() => { setName(user?.name ?? ""); setEditing(true); }} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors">
                  <MdEdit className="w-3.5 h-3.5" /> Editar
                </button>
              )}
            </div>
            {editing ? (
              <div className="flex items-center gap-2 mt-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-bg-tertiary/50 border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
                />
                <button onClick={handleSave} disabled={saving} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all disabled:opacity-50">
                  <MdCheck className="w-4 h-4" />
                </button>
                <button onClick={handleCancel} className="p-2 rounded-lg hover:bg-bg-hover text-text-muted transition-all">
                  <MdClose className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <p className="text-sm font-medium text-text-primary mt-1">{user?.name || "—"}</p>
            )}
          </div>

          {/* Email (read-only) */}
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-text-muted text-xs mb-1">
              <MdEmail className="w-4 h-4" />
              Email
            </div>
            <p className="text-sm font-medium text-text-primary">{user?.email || "—"}</p>
            <p className="text-xs text-text-muted mt-1">El email no puede modificarse desde aquí</p>
          </div>

          {/* Role (read-only) */}
          <div className="bg-bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 text-text-muted text-xs mb-1">
              <MdBadge className="w-4 h-4" />
              Rol
            </div>
            <p className="text-sm font-medium text-text-primary">{user?.role || "Sin rol asignado"}</p>
          </div>
        </div>

        {/* Session info */}
        <div className="bg-bg-card border border-border rounded-xl p-4 text-xs text-text-muted space-y-1">
          <p>ID de sesión: <span className="font-mono text-text-secondary">{session?.session?.id?.slice(0, 16)}…</span></p>
          <p>Sesión iniciada: <span className="text-text-secondary">{session?.session?.createdAt ? new Date(session.session.createdAt).toLocaleString("es-ES") : "—"}</span></p>
        </div>
      </div>
    </PanelHeader>
  );
}
