import type { Pago } from "../types";
import { estadoPagoLabels, metodoPagoLabels } from "../types";
import { cn } from "@/shared/utils/cn";
import { MdPayment, MdCalendarToday, MdPerson } from "react-icons/md";
import { formatUTCDate } from "@/shared/utils/format";

interface PagoCardProps {
  pago: Pago;
  onClick: () => void;
}

export function PagoCard({ pago, onClick }: PagoCardProps) {
  const estadoColors: Record<string, string> = {
    CONFIRMADO: "bg-success-bg text-success",
    DEVUELTO: "bg-warning-bg text-warning",
    RETENIDO: "bg-warning-bg text-warning",
    ANULADO: "bg-danger-bg text-danger",
  };

  return (
    <div onClick={onClick} className="bg-paper-lightest rounded-2xl p-5 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-border-light/30">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            estadoColors[pago.estado] || "bg-paper-medium/30"
          )}>
            <MdPayment className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-lg font-display">{pago.moneda} {parseFloat(pago.monto).toFixed(2)}</p>
            <p className="text-text-muted text-sm">{metodoPagoLabels[pago.metodo]}</p>
          </div>
        </div>
        <span className={cn(
          "px-2.5 py-1 text-xs font-semibold rounded-full",
          estadoColors[pago.estado] || "bg-paper-medium/30"
        )}>
          {estadoPagoLabels[pago.estado]}
        </span>
      </div>

      <div className="mt-3 pt-3 border-t border-border-light/30 space-y-1.5">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <MdCalendarToday className="w-4 h-4 flex-shrink-0" />
          <span>{formatUTCDate(pago.fecha_pago)}</span>
        </div>
        {pago.recibido_por && (
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <MdPerson className="w-4 h-4 flex-shrink-0" />
            <span>{pago.recibido_por.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
