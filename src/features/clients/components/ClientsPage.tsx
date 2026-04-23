import { useState } from "react";
import { authClient } from "@/shared/lib/auth";
import { PanelHeader, Button, EmptyState, Loading, Modal, ConfirmDialog, Pagination } from "@/components";
import { HuespedModal } from "./HuespedModal";
import { HuespedCard } from "./HuespedCard";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import type { Huesped } from "../types";
import { MdPeople, MdEmail, MdPhone, MdPerson, MdNotes, MdSearch } from "react-icons/md";
import { useHuespedes } from "../hooks/useHuespedes";

export default function ClientsPage() {
  const { data: session } = authClient.useSession();
  const {
    huespedes, pagination, limit, error,
    fetchHuespedes, goToPage, changeLimit, changeSearch, deleteHuesped,
  } = useHuespedes();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedHuesped, setSelectedHuesped] = useState<Huesped | null>(null);
  const [editingHuesped, setEditingHuesped] = useState<Huesped | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Huesped | null>(null);
  const [deleteManyIds, setDeleteManyIds] = useState<string[] | null>(null);
  const [search, setSearch] = useState("");

  const handleSearchChange = (q: string) => {
    setSearch(q);
    changeSearch(q);
  };

  if (!session) return <Loading text="Verificando sesión..." />;
  if (error) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-danger">{error}</div></div>;

  const handleDelete = async (huesped?: Huesped) => {
    const target = huesped ?? selectedHuesped;
    if (!target) return;
    setDeleting(true);
    try {
      await deleteHuesped(target.id);
      if (target.id === selectedHuesped?.id) setSelectedHuesped(null);
    } catch (err) {
      if (!isHandledError(err)) { sileo.error({ title: "Error", description: "No se pudo eliminar el huésped. Puede tener reservas asociadas." }); }
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteMany = async (ids: string[]) => {
    setDeleting(true);
    try {
      await Promise.all(ids.map((id) => deleteHuesped(id)));
      sileo.success({ title: "Eliminados", description: `${ids.length} huésped${ids.length !== 1 ? "es eliminados" : " eliminado"}` });
    } catch (err) {
      if (!isHandledError(err)) { sileo.error({ title: "Error", description: "No se pudieron eliminar algunos huéspedes" }); }
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (huesped: Huesped) => {
    setEditingHuesped(huesped);
    setIsEditModalOpen(true);
    setSelectedHuesped(null);
  };

  return (
    <>
      <PanelHeader
        title="Huéspedes"
        subtitle="Gestión de clientes y huéspedes del hotel"
        action={<Button onClick={() => setIsModalOpen(true)}>+ Nuevo Huésped</Button>}
      >
        {pagination.total === 0 && !search ? (
          <EmptyState
            icon={<MdPeople className="w-10 h-10 text-text-muted/50" />}
            title="Sin huéspedes"
            description="Comienza agregando tu primer huésped"
            action={<Button onClick={() => setIsModalOpen(true) }>Agregar Huésped</Button>}
          />
        ) : (
          <div className="space-y-4">
            <div className="relative max-w-xs">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {huespedes.map((huesped) => (
                <HuespedCard
                  key={huesped.id}
                  huesped={huesped}
                  onEdit={(e) => {
                    e.stopPropagation();
                    handleEdit(huesped);
                  }}
                  onDelete={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(huesped);
                  }}
                />
              ))}
            </div>

            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              onPageChange={goToPage}
              label={pagination.total === 0 ? "Sin resultados" : `${(pagination.page - 1) * limit + 1}–${Math.min(pagination.page * limit, pagination.total)} de ${pagination.total} huésped${pagination.total !== 1 ? "es" : ""}`}
              pageSizeValue={limit}
              onPageSizeChange={changeLimit}
              pageSizeOptions={[5, 10, 25, 50]}
              className="px-0"
            />
          </div>
        )}
      </PanelHeader>

      <HuespedModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchHuespedes} />
      <HuespedModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditingHuesped(null); }} onSuccess={fetchHuespedes} huesped={editingHuesped} />

      {selectedHuesped && (
        <Modal isOpen={!!selectedHuesped} onClose={() => setSelectedHuesped(null)} title="Detalle del Huésped">
          <div className="space-y-5">
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-paper-medium/20 rounded-xl p-3">
                <MdEmail className="w-5 h-5 text-text-muted flex-shrink-0" />
                <div><p className="text-text-muted text-xs">Email</p><p className="text-sm font-medium">{selectedHuesped.email}</p></div>
              </div>
              <div className="flex items-center gap-3 bg-paper-medium/20 rounded-xl p-3">
                <MdPhone className="w-5 h-5 text-text-muted flex-shrink-0" />
                <div><p className="text-text-muted text-xs">Teléfono</p><p className="text-sm font-medium">{selectedHuesped.telefono}</p></div>
              </div>
              <div className="flex items-center gap-3 bg-paper-medium/20 rounded-xl p-3">
                <MdPerson className="w-5 h-5 text-text-muted flex-shrink-0" />
                <div><p className="text-text-muted text-xs">Nacionalidad</p><p className="text-sm font-medium">{selectedHuesped.nacionalidad}</p></div>
              </div>
              {selectedHuesped.observacion && (
                <div className="flex items-start gap-3 bg-paper-medium/10 rounded-xl p-3">
                  <MdNotes className="w-5 h-5 text-text-muted flex-shrink-0 mt-0.5" />
                  <div><p className="text-text-muted text-xs">Observación</p><p className="text-sm">{selectedHuesped.observacion}</p></div>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => handleEdit(selectedHuesped)} className="flex-1 py-3 bg-accent-primary/10 text-accent-primary font-medium rounded-xl hover:bg-accent-primary/20 transition-all border border-accent-primary/20">Editar</button>
              <button onClick={() => setDeleteTarget(selectedHuesped)} disabled={deleting} className="flex-1 py-3 bg-danger-bg text-danger font-medium rounded-xl hover:bg-danger-bg transition-all border border-danger/20 disabled:opacity-50">{deleting ? "Eliminando..." : "Eliminar"}</button>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Eliminar huésped"
        description={
          deleteTarget ? `¿Estás seguro de eliminar a ${deleteTarget.nombres} ${deleteTarget.apellidos}?` : undefined
        }
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

      <ConfirmDialog
        isOpen={!!deleteManyIds}
        onClose={() => setDeleteManyIds(null)}
        title="Eliminar huéspedes"
        description={
          deleteManyIds
            ? `¿Eliminar ${deleteManyIds.length} huésped${deleteManyIds.length !== 1 ? "es" : ""}?`
            : undefined
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
        isConfirmLoading={deleting}
        onConfirm={async () => {
          if (!deleteManyIds) return;
          const ids = deleteManyIds;
          setDeleteManyIds(null);
          await handleDeleteMany(ids);
        }}
      />
    </>
  );
}
