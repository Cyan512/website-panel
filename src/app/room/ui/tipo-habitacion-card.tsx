import type { TipoHabitacion } from "@/app/room/dom/TipoHabitacion";
import { cn } from "@/utils/cn";

type TipoHabitacionCardProps = {
  tipo: TipoHabitacion;
  onClick?: () => void;
};

export function TipoHabitacionCard({ tipo, onClick }: TipoHabitacionCardProps) {
  return (
    <div
      key={tipo.id}
      onClick={onClick}
      className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-paper-lightest rounded-2xl border border-border-light/50 hover:border-accent-primary/30"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-primary to-accent-light" />
      
      <div className="p-4 pt-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-300 group-hover:scale-110 bg-accent-primary/10 text-accent-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-text-darkest text-sm">
                {tipo.nombre}
              </p>
              <p className="text-xs text-text-muted line-clamp-1">
                {tipo.descripcion || "Sin descripción"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2 pt-3 border-t border-border-light/30">
          <span className={cn(
            "px-2 py-1 text-[10px] font-semibold rounded-full flex items-center gap-1",
            tipo.tiene_ducha 
              ? "bg-emerald-100 text-emerald-700" 
              : "bg-stone-100 text-stone-500"
          )}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
            Ducha
          </span>
          <span className={cn(
            "px-2 py-1 text-[10px] font-semibold rounded-full flex items-center gap-1",
            tipo.tiene_banio 
              ? "bg-emerald-100 text-emerald-700" 
              : "bg-stone-100 text-stone-500"
          )}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Baño
          </span>
          <span className="px-2 py-1 text-[10px] font-semibold rounded-full bg-accent-primary/10 text-accent-primary">
            {tipo.muebles?.length || 0} muebles
          </span>
        </div>
      </div>
    </div>
  );
}
