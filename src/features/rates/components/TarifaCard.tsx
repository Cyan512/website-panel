import type { Tarifa } from "../types";

interface Props {
  tarifa: Tarifa;
  onClick: () => void;
}

export function TarifaCard({ tarifa, onClick }: Props) {
  const precioTotal =
    tarifa.precio_noche +
    (tarifa.iva != null ? (tarifa.precio_noche * tarifa.iva) / 100 : 0) +
    (tarifa.cargo_servicios != null ? (tarifa.precio_noche * tarifa.cargo_servicios) / 100 : 0);

  return (
    <div
      onClick={onClick}
      className="rounded-2xl border border-border bg-bg-card p-4 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-xs text-text-muted">{tarifa.tipo_habitacion.nombre}</p>
          <p className="text-sm font-semibold text-text-primary mt-0.5">{tarifa.canal.nombre}</p>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent-primary/10 text-accent-primary shrink-0">
          {tarifa.moneda}
        </span>
      </div>

      <p className="text-2xl font-bold font-playfair text-accent-primary">
        {tarifa.precio_noche.toFixed(2)}
        <span className="text-xs font-normal text-text-muted ml-1">/ noche</span>
      </p>

      {(tarifa.iva != null || tarifa.cargo_servicios != null) && (
        <div className="mt-2 space-y-0.5">
          {tarifa.iva != null && (
            <p className="text-xs text-text-muted">IVA: {tarifa.iva}%</p>
          )}
          {tarifa.cargo_servicios != null && (
            <p className="text-xs text-text-muted">Serv: {tarifa.cargo_servicios}%</p>
          )}
          <p className="text-xs font-medium text-text-primary">
            Total: {tarifa.moneda} {precioTotal.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}
