import type { Mueble } from "../types";
import { cn } from "@/shared/utils/cn";

type StockCardProps = {
  mueble: Mueble;
  onClick?: () => void;
};

const CONDICION_LABELS: Record<string, string> = {
  BUENO: "Bueno",
  REGULAR: "Regular",
  DANADO: "Dañado",
  FALTANTE: "Faltante",
};

const CATEGORY_ICONS: Record<string, string> = {
  "CAMA": "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  "ASIENTO": "M4 19V9m8 0h.01M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  "ALMACENAJE": "M5 5a2 2 0 012-2h10a2 2 0 012 2v0a2 2 0 01-2 2H7a2 2 0 01-2-2v0zm-2 4v6a2 2 0 002 2h12a2 2 0 002-2v-6M12 9v-5",
  "TECNOLOGIA": "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  "BANO": "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  "DECORACION": "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  "default": "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
};

export { CONDICION_LABELS };

export function StockCard({ mueble, onClick }: StockCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-paper-lightest rounded-2xl border border-border-light/50 hover:border-accent-primary/30"
    >
      <div className={cn(
        "absolute top-0 left-0 w-full h-1 transition-all duration-300",
        mueble.condicion === "BUENO" ? "bg-gradient-to-r from-success/60 to-success" :
        mueble.condicion === "REGULAR" ? "bg-gradient-to-r from-warning/60 to-warning" :
        mueble.condicion === "DANADO" ? "bg-gradient-to-r from-danger/60 to-danger" :
        "bg-gradient-to-r from-text-muted/40 to-text-muted/60"
      )} />
      
      <div className="p-4 pt-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
              mueble.condicion === "BUENO" ? "bg-success-bg text-success" :
              mueble.condicion === "REGULAR" ? "bg-warning-bg text-warning" :
              mueble.condicion === "DANADO" ? "bg-danger-bg text-danger" :
              "bg-bg-tertiary text-text-muted"
            )}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={CATEGORY_ICONS[mueble.categoria] || CATEGORY_ICONS.default} />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-text-darkest text-sm line-clamp-1">{mueble.nombre}</p>
              <p className="text-xs text-text-muted">{mueble.codigo}</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-3 border-t border-border-light/30">
          <div>
            <p className="text-[10px] text-text-muted uppercase tracking-wider">Categoría</p>
            <p className="text-xs font-medium text-text-dark">{mueble.categoria}</p>
          </div>
          <span className={cn(
            "px-2.5 py-1 text-[10px] font-semibold rounded-full uppercase tracking-wide",
            mueble.condicion === "BUENO" ? "bg-success-bg text-success" :
            mueble.condicion === "REGULAR" ? "bg-warning-bg text-warning" :
            mueble.condicion === "DANADO" ? "bg-danger-bg text-danger" :
            "bg-bg-tertiary text-text-muted"
          )}>
            {CONDICION_LABELS[mueble.condicion]}
          </span>
        </div>
      </div>
    </div>
  );
}
