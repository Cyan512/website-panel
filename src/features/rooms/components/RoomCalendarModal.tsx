import { useState, useEffect, useMemo, useCallback } from "react";
import { Modal } from "@/components";
import { roomsApi } from "../api";
import type { Habitacion, FechaReserva, EstadoReservaHab } from "../types";
import { cn } from "@/shared/utils/cn";
import { Spinner } from "@/shared/components/ui/spinner";
import { MdChevronLeft, MdChevronRight, MdCalendarMonth } from "react-icons/md";

const DAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];
const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const ALL_TIPOS_RESERVA: { value: EstadoReservaHab; label: string; colorClass: string; dotClass: string }[] = [
  { value: "CONFIRMADA", label: "Confirmada", colorClass: "bg-info/15 text-info border-info/30", dotClass: "bg-info" },
  { value: "EN_CASA", label: "En Casa", colorClass: "bg-danger/15 text-danger border-danger/30", dotClass: "bg-danger" },
  { value: "TENTATIVA", label: "Tentativa", colorClass: "bg-warning/15 text-warning border-warning/30", dotClass: "bg-warning" },
  { value: "COMPLETADA", label: "Completada", colorClass: "bg-accent-primary/15 text-accent-primary border-accent-primary/30", dotClass: "bg-accent-primary" },
  { value: "CANCELADA", label: "Cancelada", colorClass: "bg-bg-tertiary text-text-muted border-border", dotClass: "bg-text-muted" },
  { value: "NO_LLEGO", label: "No Llegó", colorClass: "bg-bg-tertiary text-text-muted border-border", dotClass: "bg-text-muted" },
];

function parseUTC(dateString: string): Date {
  const date = new Date(dateString);
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
}

function toYMD(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

interface CalendarDayInfo {
  day: number;
  dateStr: string;
  isToday: boolean;
  isPast: boolean;
  reservas: FechaReserva[];
}

function buildCalendarDays(year: number, month: number, fechasReserva: FechaReserva[]): CalendarDayInfo[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalDays = lastDay.getDate();
  const today = new Date();
  const todayStr = toYMD(today);

  const cells: CalendarDayInfo[] = [];

  for (let i = 0; i < startOffset; i++) {
    cells.push({ day: 0, dateStr: "", isToday: false, isPast: false, reservas: [] });
  }

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const reservas = fechasReserva.filter((r) => {
      const start = toYMD(parseUTC(r.fecha_inicio));
      const end = toYMD(parseUTC(r.fecha_fin));
      return dateStr >= start && dateStr <= end;
    });
    cells.push({
      day: d,
      dateStr,
      isToday: dateStr === todayStr,
      isPast: dateStr < todayStr,
      reservas,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ day: 0, dateStr: "", isToday: false, isPast: false, reservas: [] });
  }

  return cells;
}

function getPriorityReserva(reservas: FechaReserva[]): FechaReserva | null {
  if (reservas.length === 0) return null;
  const PRIORIDAD: Record<string, number> = {
    EN_CASA: 4,
    CONFIRMADA: 3,
    TENTATIVA: 2,
    COMPLETADA: 1,
    CANCELADA: 0,
    NO_LLEGO: 0,
  };
  return [...reservas].sort((a, b) => (PRIORIDAD[b.estado] ?? 0) - (PRIORIDAD[a.estado] ?? 0))[0];
}

function getReservaColorClass(estado: string): string {
  const map: Record<string, string> = {
    CONFIRMADA: "bg-info/20 text-info border-info/30",
    EN_CASA: "bg-danger/20 text-danger border-danger/30",
    TENTATIVA: "bg-warning/20 text-warning border-warning/30",
    COMPLETADA: "bg-accent-primary/20 text-accent-primary border-accent-primary/30",
    CANCELADA: "bg-bg-tertiary text-text-muted/60 border-border/50",
    NO_LLEGO: "bg-bg-tertiary text-text-muted/60 border-border/50",
  };
  return map[estado] ?? "bg-bg-tertiary text-text-muted border-border";
}

function getReservaDotClass(estado: string): string {
  const map: Record<string, string> = {
    CONFIRMADA: "bg-info",
    EN_CASA: "bg-danger",
    TENTATIVA: "bg-warning",
    COMPLETADA: "bg-accent-primary",
    CANCELADA: "bg-text-muted/40",
    NO_LLEGO: "bg-text-muted/40",
  };
  return map[estado] ?? "bg-text-muted";
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  habitacion: Habitacion | null;
}

export function RoomCalendarModal({ isOpen, onClose, habitacion }: Props) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [selectedTipos, setSelectedTipos] = useState<Set<EstadoReservaHab>>(new Set(["CONFIRMADA", "EN_CASA", "TENTATIVA"]));
  const [fechasReserva, setFechasReserva] = useState<FechaReserva[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    if (!habitacion) return;
    try {
      setLoading(true);
      const tiposArray = Array.from(selectedTipos);
      const data = await roomsApi.getById(habitacion.id, tiposArray.length > 0 ? tiposArray : undefined, signal);
      setFechasReserva(data.fechas_reserva ?? []);
    } catch (err: any) {
      if (err.name !== "AbortError" && err.name !== "CanceledError") {
        // silent
      }
    } finally {
      setLoading(false);
    }
  }, [habitacion, selectedTipos]);

  useEffect(() => {
    if (!isOpen || !habitacion) return;
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [isOpen, habitacion, fetchData]);

  useEffect(() => {
    if (isOpen) {
      setYear(new Date().getFullYear());
      setMonth(new Date().getMonth());
    }
  }, [isOpen]);

  const toggleTipo = (tipo: EstadoReservaHab) => {
    setSelectedTipos((prev) => {
      const next = new Set(prev);
      if (next.has(tipo)) next.delete(tipo);
      else next.add(tipo);
      return next;
    });
  };

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  const calendarDays = useMemo(() => buildCalendarDays(year, month, fechasReserva), [year, month, fechasReserva]);

  if (!habitacion) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Habitación ${habitacion.nro_habitacion} — Disponibilidad`}
      size="3xl"
    >
      <div className="max-h-[75vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
          {/* Calendario */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MdCalendarMonth className="w-5 h-5 text-accent-primary" />
                <h2 className="text-lg font-semibold text-text-primary">Calendario</h2>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-bg-secondary transition-colors text-text-muted">
                  <MdChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-base font-semibold text-text-primary min-w-[140px] text-center">
                  {MONTHS_ES[month]} {year}
                </span>
                <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-bg-secondary transition-colors text-text-muted">
                  <MdChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-12">
                <Spinner size="lg" className="text-accent-primary" />
              </div>
            )}

            {!loading && (
              <>
                <div className="grid grid-cols-7 gap-1">
                  {DAYS.map((d) => (
                    <div key={d} className="text-center text-xs font-semibold text-text-muted py-2">
                      {d}
                    </div>
                  ))}
                  {calendarDays.map((cell, i) => {
                    if (cell.day === 0) {
                      return <div key={`empty-${i}`} className="aspect-square" />;
                    }
                    const topReserva = getPriorityReserva(cell.reservas);
                    const colorClass = topReserva ? getReservaColorClass(topReserva.estado) : "";
                    const dotClass = topReserva ? getReservaDotClass(topReserva.estado) : "";
                    return (
                      <div
                        key={cell.dateStr}
                        className={cn(
                          "aspect-square flex flex-col items-center justify-center rounded-xl border text-sm font-medium transition-all",
                          cell.isToday && "ring-2 ring-primary ring-offset-1 ring-offset-bg-card",
                          cell.isPast && !topReserva && "text-text-muted/30 bg-bg-secondary/30 border-transparent",
                          !cell.isPast && !topReserva && "bg-success/10 text-success border-success/10",
                          topReserva && colorClass,
                        )}
                        title={topReserva ? `${topReserva.estado}: ${topReserva.fecha_inicio.slice(0, 10)} → ${topReserva.fecha_fin.slice(0, 10)}` : "Libre"}
                      >
                        <span>{cell.day}</span>
                        {topReserva && <span className={cn("w-1.5 h-1.5 rounded-full mt-0.5", dotClass)} />}
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border/50">
                  <span className="flex items-center gap-1.5 text-xs text-text-muted">
                    <span className="w-3 h-3 rounded-sm bg-success/20 border border-success/20 inline-block" /> Libre
                  </span>
                  {ALL_TIPOS_RESERVA.filter((t) => selectedTipos.has(t.value)).map((t) => (
                    <span key={t.value} className="flex items-center gap-1.5 text-xs text-text-muted">
                      <span className={cn("w-3 h-3 rounded-sm border inline-block", t.colorClass.split(" ")[0])} />
                      {t.label}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sidebar derecha: contadores + filtros */}
          <div className="space-y-4">
            <div className="bg-bg-card border border-border rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide">Reservas</h3>
              <div className="grid grid-cols-2 gap-2">
                {ALL_TIPOS_RESERVA.map((t) => {
                  const count = fechasReserva.filter((r) => r.estado === t.value).length;
                  return (
                    <div
                      key={t.value}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-xl border px-3 py-3 transition-all",
                        count > 0 ? t.colorClass : "bg-bg-secondary text-text-muted border-border"
                      )}
                    >
                      <span className={cn("text-2xl font-bold leading-none", count > 0 ? undefined : "text-text-muted")}>{count}</span>
                      <span className="text-[10px] font-medium uppercase tracking-wide mt-1">{t.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-bg-card border border-border rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide">Filtros de reserva</h3>
              <div className="flex flex-col gap-2">
                {ALL_TIPOS_RESERVA.map((t) => {
                  const active = selectedTipos.has(t.value);
                  return (
                    <button
                      key={t.value}
                      onClick={() => toggleTipo(t.value)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all text-left",
                        active ? t.colorClass : "bg-bg-secondary text-text-muted border-border hover:text-text-primary"
                      )}
                    >
                      <span className={cn("w-2 h-2 rounded-full", active ? t.dotClass : "bg-text-muted/30")} />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {fechasReserva.length > 0 && (
              <div className="bg-bg-card border border-border rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                  Reservas ({fechasReserva.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {fechasReserva.map((r, i) => {
                    const tipoInfo = ALL_TIPOS_RESERVA.find((t) => t.value === r.estado);
                    return (
                      <div
                        key={i}
                        className={cn(
                          "flex items-center justify-between rounded-xl px-3 py-2.5 border text-xs",
                          tipoInfo?.colorClass ?? "bg-bg-tertiary text-text-muted border-border"
                        )}
                      >
                        <span className="font-medium">
                          {r.fecha_inicio.slice(0, 10)} → {r.fecha_fin.slice(0, 10)}
                        </span>
                        <span className="font-semibold uppercase tracking-wide text-[10px]">
                          {tipoInfo?.label ?? r.estado}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
