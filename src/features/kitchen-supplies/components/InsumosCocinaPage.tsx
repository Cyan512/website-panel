import { useState } from "react";
import { PanelHeader, Button, ConfirmDialog } from "@/components";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import { MdAdd } from "react-icons/md";
import { useInsumosCocina } from "../hooks/useInsumosCocina";
import { authClient } from "@/shared/lib/auth";
import { TipoMovimiento } from "../types";
import type { InsumoCocina, CreateInsumoCocina, UpdateInsumoCocina, CreateMovimientoCocina } from "../types";
import { InsumosCocinaTable } from "./InsumosCocinaTable";
import { InsumoCocinaModal, type InsumoFormState } from "./InsumoCocinaModal";
import { MovimientoCocinaModal, type MovForm } from "./MovimientoCocinaModal";

export default function InsumosCocinaPage() {
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const {
    paginated,
    loading,
    error,
    search,
    setSearch,
    page,
    setPage,
    limit,
    setLimit,
    totalPages,
    createInsumo,
    updateInsumo,
    deleteInsumo,
    registrarMovimiento,
  } = useInsumosCocina();

  const [insumoModal, setInsumoModal] = useState(false);
  const [editingInsumo, setEditingInsumo] = useState<InsumoCocina | null>(null);
  const [savingInsumo, setSavingInsumo] = useState(false);

  const [movModal, setMovModal] = useState(false);
  const [movTarget, setMovTarget] = useState<InsumoCocina | null>(null);
  const [savingMov, setSavingMov] = useState(false);

  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<InsumoCocina | null>(null);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-text-muted text-sm">
        Cargando insumos de cocina...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-danger text-sm">{error}</div>
    );

  // ── Insumo CRUD ──
  const openCreate = () => {
    setEditingInsumo(null);
    setInsumoModal(true);
  };
  const openEdit = (i: InsumoCocina) => {
    setEditingInsumo(i);
    setInsumoModal(true);
  };
  const closeInsumoModal = () => {
    setInsumoModal(false);
    setEditingInsumo(null);
  };

  const handleInsumoSubmit = async (insumoForm: InsumoFormState) => {
    if (!insumoForm.codigo.trim() || !insumoForm.nombre.trim()) {
      sileo.warning({ title: "Campos requeridos", description: "Código y nombre son obligatorios" });
      return;
    }
    setSavingInsumo(true);
    try {
      if (editingInsumo) {
        const payload: UpdateInsumoCocina = {
          codigo: insumoForm.codigo.trim(),
          nombre: insumoForm.nombre.trim(),
          unidad: insumoForm.unidad,
          stock_actual: Number(insumoForm.stock_actual),
          stock_minimo: Number(insumoForm.stock_minimo),
          notas: insumoForm.notas.trim() || undefined,
          activo: insumoForm.activo,
        };
        await updateInsumo(editingInsumo.id, payload);
      } else {
        const payload: CreateInsumoCocina = {
          codigo: insumoForm.codigo.trim(),
          nombre: insumoForm.nombre.trim(),
          unidad: insumoForm.unidad,
          stock_actual: Number(insumoForm.stock_actual),
          stock_minimo: Number(insumoForm.stock_minimo),
          notas: insumoForm.notas.trim() || undefined,
        };
        await createInsumo(payload);
      }
      closeInsumoModal();
    } catch (err) {
      if (!isHandledError(err))
        sileo.error({ title: "Error", description: "No se pudo guardar el insumo" });
    } finally {
      setSavingInsumo(false);
    }
  };

  const handleDelete = async (i: InsumoCocina) => {
    setDeleting(true);
    try {
      await deleteInsumo(i.id);
    } catch (err) {
      if (!isHandledError(err))
        sileo.error({ title: "Error", description: "No se pudo eliminar el insumo" });
    } finally {
      setDeleting(false);
    }
  };

  // ── Movimiento ──
  const openMov = (i: InsumoCocina) => {
    setMovTarget(i);
    setMovModal(true);
  };
  const closeMovModal = () => {
    setMovModal(false);
    setMovTarget(null);
  };

  const handleMovSubmit = async (movForm: MovForm) => {
    if (!movTarget || !movForm.cantidad || Number(movForm.cantidad) <= 0) {
      sileo.warning({ title: "Cantidad inválida", description: "Ingresa una cantidad mayor a 0" });
      return;
    }
    setSavingMov(true);
    try {
      const payload: CreateMovimientoCocina = {
        insumo_id: movTarget.id,
        tipo: movForm.tipo,
        cantidad: Number(movForm.cantidad),
        ...(movForm.tipo === TipoMovimiento.Entrada && movForm.motivo_entrada
          ? { motivo_entrada: movForm.motivo_entrada }
          : {}),
        ...(movForm.tipo === TipoMovimiento.Salida && movForm.motivo_salida
          ? { motivo_salida: movForm.motivo_salida }
          : {}),
        notas: movForm.notas.trim() || undefined,
      };
      await registrarMovimiento(payload);
      closeMovModal();
    } catch (err) {
      if (!isHandledError(err))
        sileo.error({ title: "Error", description: "No se pudo registrar el movimiento" });
    } finally {
      setSavingMov(false);
    }
  };

  return (
    <>
      <PanelHeader
        title="Insumos de Cocina"
        subtitle="Control de stock e inventario de cocina"
        action={
          isAdmin ? (
            <Button onClick={openCreate}>
              <MdAdd className="w-4 h-4 mr-1" />
              Nuevo Insumo
            </Button>
          ) : undefined
        }
      >
        <div className="flex flex-col flex-1 min-h-0">
          <InsumosCocinaTable
            insumos={paginated}
            isAdmin={isAdmin}
            search={search}
            onSearchChange={setSearch}
            page={page}
            onPageChange={setPage}
            limit={limit}
            onLimitChange={setLimit}
            totalPages={totalPages}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
            onMovimiento={openMov}
            deleting={deleting}
          />
        </div>
      </PanelHeader>

      {/* ── Insumo Modal ── */}
      {isAdmin && (
        <InsumoCocinaModal
          isOpen={insumoModal}
          onClose={closeInsumoModal}
          onSubmit={handleInsumoSubmit}
          editingInsumo={editingInsumo}
          saving={savingInsumo}
        />
      )}

      {/* ── Movimiento Modal ── */}
      {isAdmin && (
        <MovimientoCocinaModal
          isOpen={movModal}
          onClose={closeMovModal}
          onSubmit={handleMovSubmit}
          insumo={movTarget}
          saving={savingMov}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar insumo"
        description={deleteTarget ? `¿Eliminar "${deleteTarget.nombre}"?` : undefined}
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
