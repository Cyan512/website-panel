import type { Huesped } from "../types";
import { cn } from "@/shared/utils/cn";
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
          "bg-accent-primary/10 text-accent-primary"
        )}>
          {huesped.nombres.charAt(0)}{huesped.apellidos.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">

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
