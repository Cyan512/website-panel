import type { Mueble } from "@/app/stock/dom/Mueble";
import { cn } from "@/utils/cn";
import type { MuebleCondicion } from "../dom/MuebleCondicion";

type StockCardProps = {
  mueble: Mueble;
  onClick?: () => void;
};

export const CONDICION_COLORS: Record<MuebleCondicion, string> = {
  BUENO: "bg-emerald-500",
  REGULAR: "bg-amber-500",
  DANADO: "bg-red-500",
  FALTANTE: "bg-stone-500",
} as const;

export const CONDICION_LABELS: Record<MuebleCondicion, string> = {
  BUENO: "Bueno",
  REGULAR: "Regular",
  DANADO: "Dañado",
  FALTANTE: "Faltante",
} as const;

export function StockCard({ mueble, onClick }: StockCardProps) {
  return (
    <div
      onClick={onClick}
      className="overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 border text-xs"
    >
      <div className="p-3 flex justify-between items-start">
        <div>
          <div className="leading-none font-medium">{mueble.nombre}</div>
          <div className="text-stone-500 text-[10px] mt-0.5">{mueble.codigo}</div>
        </div>
        <div
          className={cn(
            "w-2 h-2 rounded-full mt-1 shrink-0",
            CONDICION_COLORS[mueble.condicion],
          )}
        />
      </div>
      <div className="border-t px-3 py-1.5 flex justify-between items-center italic">
        <div className="text-[10px]">{mueble.categoria}</div>
        <div className="text-[10px]">{mueble.tipo || "-"}</div>
      </div>
    </div>
  );
}
