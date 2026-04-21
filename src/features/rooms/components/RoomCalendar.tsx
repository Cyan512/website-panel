import { useState } from "react";
import { cn } from "@/shared/utils/cn";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import type { FechaReserva } from "../types";

interface Props {
  fechasReserva: FechaReserva[];
}

const DAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];
const MONTHS_ES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

// Parse UTC date string to Date object (handles timezone offset)
function parseUTC(dateString: string): Date {
  const date = new Date(dateString);
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
}

function toYMD(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function RoomCalendar({ fechasReserva }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  // Build set of occupied dates
  const occupiedDates = new Set<string>();
  fechasReserva.forEach((r) => {
    const start = parseUTC(r.fecha_inicio);
    const end = parseUTC(r.fecha_fin);
    const cur = new Date(start);
    while (cur <= end) {
      occupiedDates.add(toYMD(cur));
      cur.setDate(cur.getDate() + 1);
    }
  });

  // Build calendar grid
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // Monday-based: 0=Mon ... 6=Sun
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  const todayStr = toYMD(today);

  return (
    <div className="select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-bg-hover transition-colors text-text-muted">
          <MdChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-text-primary">
          {MONTHS_ES[month]} {year}
        </span>
        <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-bg-hover transition-colors text-text-muted">
          <MdChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-text-muted py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isOccupied = occupiedDates.has(dateStr);
          const isToday = dateStr === todayStr;
          const isPast = dateStr < todayStr;

          return (
            <div
              key={dateStr}
              className={cn(
                "aspect-square flex items-center justify-center rounded-md text-[11px] font-medium transition-colors",
                isToday && "ring-1 ring-primary",
                isPast && !isOccupied && "text-text-muted/40",
                !isPast && !isOccupied && "bg-emerald-500/15 text-emerald-700",
                isOccupied && "bg-red-500/15 text-red-700",
              )}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-[10px] text-text-muted">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30 inline-block" /> Libre
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-red-500/30 inline-block" /> Reservado
        </span>
      </div>
    </div>
  );
}
