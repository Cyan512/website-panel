import type { Huesped } from "../types";
import { nivelVipLabels } from "../types";
import { cn } from "@/utils/cn";
import { MdEmail, MdPhone, MdPerson } from "react-icons/md";

interface HuespedCardProps {
  huesped: Huesped;
  onClick: () => void;
}

export function HuespedCard({ huesped, onClick }: HuespedCardProps) {
  return (
    <div onClick={onClick} className="bg-paper-lightest rounded-2xl p-5 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border border-border-light/30">
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold",
          huesped.nivel_vip === 2 ? "bg-amber-100 text-amber-700" :
          huesped.nivel_vip === 1 ? "bg-indigo-100 text-indigo-700" :
          "bg-accent-primary/10 text-accent-primary"
        )}>
          {huesped.nombres.charAt(0)}{huesped.apellidos.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-text-darkest font-playfair truncate">{huesped.nombres} {huesped.apellidos}</h3>
            {huesped.nivel_vip > 0 && (
              <span className={cn(
                "px-2 py-0.5 text-xs font-semibold rounded-full",
                huesped.nivel_vip === 2 ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"
              )}>
                {nivelVipLabels[huesped.nivel_vip]}
              </span>
            )}
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <MdEmail className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{huesped.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <MdPhone className="w-4 h-4 flex-shrink-0" />
              <span>{huesped.telefono}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <MdPerson className="w-4 h-4 flex-shrink-0" />
              <span>{huesped.nacionalidad}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
