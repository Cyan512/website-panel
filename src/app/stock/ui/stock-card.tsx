import type { Mueble } from "@/app/stock/dom/Mueble";
import { cn } from "@/utils/cn";
import type { MuebleCondicion } from "../dom/MuebleCondicion";

type StockCardProps = {
  mueble: Mueble;
  onClick?: () => void;
};

export const CONDICION_COLORS: Record<MuebleCondicion, string> = {
  BUENO: "bg-emerald-500 shadow-emerald-500/50",
  REGULAR: "bg-amber-500 shadow-amber-500/50",
  DANADO: "bg-red-500 shadow-red-500/50",
  FALTANTE: "bg-stone-400 shadow-stone-500/50",
} as const;

export const CONDICION_LABELS: Record<MuebleCondicion, string> = {
  BUENO: "Bueno",
  REGULAR: "Regular",
  DANADO: "Dañado",
  FALTANTE: "Faltante",
} as const;

const CATEGORY_ICONS: Record<string, string> = {
  "Mueble": "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  "Electrodomestico": "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  "Decoracion": "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  "default": "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
};

export function StockCard({ mueble, onClick }: StockCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-paper-lightest rounded-2xl border border-border-light/50 hover:border-accent-primary/30"
    >
      {/* Status glow */}
      <div className={cn(
        "absolute top-0 left-0 w-full h-1 transition-all duration-300",
        mueble.condicion === "BUENO" ? "bg-gradient-to-r from-emerald-400 to-emerald-600" :
        mueble.condicion === "REGULAR" ? "bg-gradient-to-r from-amber-400 to-amber-600" :
        mueble.condicion === "DANADO" ? "bg-gradient-to-r from-red-400 to-red-600" :
        "bg-gradient-to-r from-stone-400 to-stone-600"
      )} />
      
      <div className="p-4 pt-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
              mueble.condicion === "BUENO" ? "bg-emerald-100 text-emerald-600" :
              mueble.condicion === "REGULAR" ? "bg-amber-100 text-amber-600" :
              mueble.condicion === "DANADO" ? "bg-red-100 text-red-600" :
              "bg-stone-100 text-stone-500"
            )}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={CATEGORY_ICONS[mueble.categoria] || CATEGORY_ICONS.default} />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-text-darkest text-sm line-clamp-1">
                {mueble.nombre}
              </p>
              <p className="text-xs text-text-muted">
                {mueble.codigo}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t border-border-light/30">
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">Categoría</p>
            <p className="text-xs font-medium text-text-dark">
              {mueble.categoria}
            </p>
          </div>
          <span className={cn(
            "px-2.5 py-1 text-[10px] font-semibold rounded-full uppercase tracking-wide",
            mueble.condicion === "BUENO" ? "bg-emerald-100 text-emerald-700" :
            mueble.condicion === "REGULAR" ? "bg-amber-100 text-amber-700" :
            mueble.condicion === "DANADO" ? "bg-red-100 text-red-700" :
            "bg-stone-100 text-stone-600"
          )}>
            {CONDICION_LABELS[mueble.condicion]}
          </span>
        </div>
      </div>
    </div>
  );
}
