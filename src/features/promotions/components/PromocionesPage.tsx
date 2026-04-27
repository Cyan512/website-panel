import { useState } from "react";
import { PanelHeader, Button, ConfirmDialog } from "@/components";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import { MdAdd } from "react-icons/md";
import { usePromociones } from "../hooks/usePromociones";
import { authClient } from "@/shared/lib/auth";
import { PromocionesTable } from "./PromocionesTable";
import { PromocionesModal } from "./PromocionesModal";
import type { Promocion, CreatePromocion, UpdatePromocion } from "../types";

// ─── helpers ────────────────────────────────────────────────────────────────

interface PromoFormState {
  codigo: string;
  tipo_descuento: "PORCENTAJE" | "MONTO_FIJO";
  valor_descuento: string;
  vig_desde: string;
  vig_hasta: string;
  estado: boolean;
  habitaciones: string[];
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function PromocionesPage() {
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const {
    filtered, paginated, loading, error,
    search, setSearch, page, setPage, limit, setLimit, totalPages,
    createPromocion, updatePromocion, deletePromocion,
  } = usePromociones();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promocion | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Promocion | null>(null);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-text-muted text-sm">Cargando promociones...</div>;
  if (error) return <div className="flex items-center justify-center min-h-[60vh] text-danger text-sm">{error}</div>;

  const openCreate = () => { setEditingPromo(null); setIsModalOpen(true); };
  const openEdit = (p: Promocion) => { setEditingPromo(p); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditingPromo(null); };

  const handleSubmit = async (form: PromoFormState) => {
    if (!form.codigo.trim() || !form.valor_descuento || !form.vig_desde || !form.vig_hasta) {
      sileo.warning({ title: "Campos requeridos", description: "Código, valor, vigencia desde y hasta son obligatorios" });
      return;
    }
    const valor = parseFloat(form.valor_descuento);
    if (isNaN(valor) || valor <= 0) {
      sileo.warning({ title: "Valor inválido", description: "El valor del descuento debe ser mayor a 0" });
      return;
    }
    setSaving(true);
    try {
      if (editingPromo) {
        const payload: UpdatePromocion = {
          codigo: form.codigo.trim(),
          tipo_descuento: form.tipo_descuento,
          valor_descuento: valor,
          vig_desde: new Date(form.vig_desde),
          vig_hasta: new Date(form.vig_hasta),
          estado: form.estado,
          habitaciones: form.habitaciones,
        };
        await updatePromocion(editingPromo.id, payload);
      } else {
        const payload: CreatePromocion = {
          codigo: form.codigo.trim(),
          tipo_descuento: form.tipo_descuento,
          valor_descuento: valor,
          vig_desde: new Date(form.vig_desde),
          vig_hasta: new Date(form.vig_hasta),
          estado: form.estado,
          habitaciones: form.habitaciones,
        };
        await createPromocion(payload);
      }
      closeModal();
    } catch (err) {
      if (!isHandledError(err)) sileo.error({ title: "Error", description: "No se pudo guardar la promoción" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: Promocion) => {
    setDeleting(true);
    try {
      await deletePromocion(p.id);
    } catch (err) {
      if (!isHandledError(err)) sileo.error({ title: "Error", description: "No se pudo eliminar la promoción" });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PanelHeader
        title="Promociones"
        subtitle="Gestión de descuentos y promociones"
        action={isAdmin ? <Button onClick={openCreate}><MdAdd className="w-4 h-4 mr-1" />Nueva Promoción</Button> : undefined}
      >
        <PromocionesTable
          promociones={paginated}
          isAdmin={isAdmin}
          search={search}
          onSearchChange={(q) => { setSearch(q); setPage(1); }}
          page={page}
          totalPages={totalPages}
          limit={limit}
          total={filtered.length}
          onPageChange={setPage}
          onLimitChange={(v) => { setLimit(v); setPage(1); }}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
          deleting={deleting}
        />
      </PanelHeader>

      {/* ── Modal ── */}
      {isAdmin && (
        <PromocionesModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleSubmit}
          editingPromo={editingPromo}
          saving={saving}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar promoción"
        description={deleteTarget ? `¿Eliminar la promoción "${deleteTarget.codigo}"?` : undefined}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
        isConfirmLoading={deleting}
        onConfirm={async () => {
          if (!deleteTarget) return;
          const target = deleteTarget;
          setDeleteTarget(null);
          await handleDelete(target);
        }}
      />
    </>
  );
}
