import { cn } from "@/shared/utils/cn";
import type { Producto } from "../types";
import { MdEdit, MdDelete } from "react-icons/md";

interface Props {
  productos: Producto[];
  isAdmin: boolean;
  onEdit: (p: Producto) => void;
  onDelete: (p: Producto) => void;
  deleting?: boolean;
}

export function ProductosTable({
  productos,
  isAdmin,
  onEdit,
  onDelete,
  deleting = false,
}: Props) {
  return (
    <div className="max-h-[calc(120dvh-420px)] overflow-y-auto scrollbar-custom">
      <table className="w-full text-base">
        <thead className="sticky top-0 bg-bg-primary z-10">
          <tr className="border-b border-border">
            <th className="text-left py-3 px-2 text-sm font-semibold text-text-muted uppercase tracking-wide">Código</th>
            <th className="text-left py-3 px-2 text-sm font-semibold text-text-muted uppercase tracking-wide">Nombre</th>
            <th className="text-left py-3 px-2 text-sm font-semibold text-text-muted uppercase tracking-wide hidden md:table-cell">Descripción</th>
            <th className="text-right py-3 px-2 text-sm font-semibold text-text-muted uppercase tracking-wide">Precio</th>
            <th className="text-right py-3 px-2 text-sm font-semibold text-text-muted uppercase tracking-wide">Stock</th>
            <th className="py-3 px-2 text-right text-sm font-semibold text-text-muted uppercase tracking-wide">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-10 text-text-muted">Sin resultados</td>
            </tr>
          ) : (
            productos.map((p) => (
              <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-accent-primary/5 transition-colors">
                <td className="py-3 px-2 text-sm font-mono text-text-muted">{p.codigo}</td>
                <td className="py-3 px-2 font-medium text-text-primary">{p.nombre}</td>
                <td className="py-3 px-2 text-text-muted text-sm hidden md:table-cell max-w-xs truncate">
                  {p.descripcion ?? "—"}
                </td>
                <td className="py-3 px-2 text-right font-semibold text-text-primary">
                  {p.precio_unitario.toFixed(2)}
                </td>
                <td className="py-3 px-2 text-right">
                  <span
                    className={cn(
                      "text-sm font-medium px-2 py-0.5 rounded-full",
                      p.stock > 10
                        ? "bg-success-bg text-success"
                        : p.stock > 0
                        ? "bg-warning-bg text-warning"
                        : "bg-danger-bg text-danger"
                    )}
                  >
                    {p.stock}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center justify-end gap-1">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => onEdit(p)}
                          title="Editar"
                          className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all"
                        >
                          <MdEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(p)}
                          disabled={deleting}
                          title="Eliminar"
                          className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger/10 transition-all disabled:opacity-40"
                        >
                          <MdDelete className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
