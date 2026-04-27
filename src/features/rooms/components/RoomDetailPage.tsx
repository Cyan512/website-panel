import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { roomsApi } from "../api";
import type { Habitacion, FechaReserva, EstadoReservaHab } from "../types";
import { cn } from "@/shared/utils/cn";
import { Spinner } from "@/shared/components/ui/spinner";
import { Button } from "@/shared/components/ui/button";
import { ImageCarousel } from "./ImageCarousel";
import {
  MdChevronLeft,
  MdChevronRight,
  MdArrowBack,
  MdCalendarMonth,
  MdBed,
  MdImage,
  MdChair,
  MdOpenInFull,
} from "react-icons/md";

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

  // Empty cells before month start
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

  // Pad to complete last row
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

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [habitacion, setHabitacion] = useState<Habitacion | null>(null);
  const [fechasReserva, setFechasReserva] = useState<FechaReserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [selectedTipos, setSelectedTipos] = useState<Set<EstadoReservaHab>>(new Set(["CONFIRMADA", "EN_CASA", "TENTATIVA"]));
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const fetchRoom = useCallback(async (signal?: AbortSignal) => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const tiposArray = Array.from(selectedTipos);
      const data = await roomsApi.getById(id, tiposArray.length > 0 ? tiposArray : undefined, signal);
      setHabitacion(data);
      setFechasReserva(data.fechas_reserva ?? []);
    } catch (err: any) {
      if (err.name !== "AbortError" && err.name !== "CanceledError") {
        setError("Error al cargar la habitación");
      }
    } finally {
      setLoading(false);
    }
  }, [id, selectedTipos]);

  useEffect(() => {
    const controller = new AbortController();
    fetchRoom(controller.signal);
    return () => controller.abort();
  }, [fetchRoom]);

  const toggleTipo = (tipo: EstadoReservaHab) => {
    setSelectedTipos((prev) => {
      const next = new Set(prev);
      if (next.has(tipo)) {
        next.delete(tipo);
      } else {
        next.add(tipo);
      }
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

  if (loading && !habitacion) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Spinner size="lg" className="text-accent-primary" />
      </div>
    );
  }

  if (error || !habitacion) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-text-muted">{error || "Habitación no encontrada"}</p>
        <Button variant="secondary" onClick={() => navigate("/rooms")}>
          <MdArrowBack className="w-4 h-4 mr-1" />
          Volver a habitaciones
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate("/rooms")}
          className="flex items-center gap-2 border-accent-primary/30 hover:bg-accent-primary/10 hover:text-accent-primary hover:border-accent-primary/50 transition-all"
        >
          <MdArrowBack className="w-4 h-4" />
          <span className="text-sm font-medium">Volver</span>
        </Button>
        <div>
          <h1 className="text-4xl font-bold font-display text-text-primary tracking-tight">
            Habitación {habitacion.nro_habitacion}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / Center: Calendar (focus) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-bg-card border border-border rounded-2xl p-5 space-y-4">
            {/* Calendar header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MdCalendarMonth className="w-5 h-5 text-accent-primary" />
                <h2 className="text-lg font-semibold text-text-primary">Disponibilidad</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={prevMonth}
                  className="p-2 rounded-xl hover:bg-bg-secondary transition-colors text-text-muted"
                >
                  <MdChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-base font-semibold text-text-primary min-w-[140px] text-center">
                  {MONTHS_ES[month]} {year}
                </span>
                <button
                  onClick={nextMonth}
                  className="p-2 rounded-xl hover:bg-bg-secondary transition-colors text-text-muted"
                >
                  <MdChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {ALL_TIPOS_RESERVA.map((t) => {
                const active = selectedTipos.has(t.value);
                return (
                  <button
                    key={t.value}
                    onClick={() => toggleTipo(t.value)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all",
                      active
                        ? t.colorClass
                        : "bg-bg-secondary text-text-muted border-border hover:text-text-primary"
                    )}
                  >
                    <span className={cn("w-2 h-2 rounded-full", active ? t.dotClass : "bg-text-muted/30")} />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Large Calendar Grid */}
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
                    {topReserva && (
                      <span className={cn("w-1.5 h-1.5 rounded-full mt-0.5", dotClass)} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
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
          </div>

          {/* Reservas list */}
          {fechasReserva.length > 0 && (
            <div className="bg-bg-card border border-border rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wide">
                Reservas vinculadas ({fechasReserva.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {fechasReserva.map((r, i) => {
                  const tipoInfo = ALL_TIPOS_RESERVA.find((t) => t.value === r.estado);
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-4 py-3 border text-sm",
                        tipoInfo?.colorClass ?? "bg-bg-tertiary text-text-muted border-border"
                      )}
                    >
                      <span className="font-medium">
                        {r.fecha_inicio.slice(0, 10)} → {r.fecha_fin.slice(0, 10)}
                      </span>
                      <span className="font-semibold uppercase tracking-wide text-xs">
                        {tipoInfo?.label ?? r.estado}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Room info sidebar */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <div className="bg-bg-card border border-border rounded-2xl overflow-hidden flex flex-col max-h-[calc(100vh-8rem)]">
            {/* Compact info header */}
            <div className="p-4 border-b border-border/50 space-y-3">
              <div className="flex items-center gap-2 text-text-muted">
                <MdBed className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Información</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-paper-medium/10 rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-text-muted uppercase tracking-wide">Número</p>
                  <p className="text-lg font-bold text-text-primary leading-tight mt-0.5">{habitacion.nro_habitacion}</p>
                </div>
                <div className="bg-paper-medium/10 rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-text-muted uppercase tracking-wide">Piso</p>
                  <p className="text-lg font-bold text-text-primary leading-tight mt-0.5">{habitacion.piso}</p>
                </div>
                <div className="bg-paper-medium/10 rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-text-muted uppercase tracking-wide">Tipo</p>
                  <p className="text-sm font-bold text-text-primary leading-tight mt-0.5 truncate">{habitacion.tipo_habitacion?.nombre ?? "—"}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className={cn(
                    "text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide",
                    habitacion.estado
                      ? "bg-success-bg text-success border border-success/20"
                      : "bg-bg-tertiary text-text-muted border border-border/50"
                  )}
                >
                  {habitacion.estado ? "Disponible" : "No disponible"}
                </span>
                {habitacion.feature && habitacion.feature.split(",").map((f, i) => (
                  <span key={i} className="text-[10px] font-semibold px-2 py-1 rounded-full border bg-info-bg text-info border-info/20">{f.trim()}</span>
                ))}
                {habitacion.amenities && habitacion.amenities.split(",").map((a, i) => (
                  <span key={i} className="text-[10px] font-semibold px-2 py-1 rounded-full border bg-accent-primary/10 text-accent-primary border-accent-primary/20">{a.trim()}</span>
                ))}
              </div>

              {habitacion.descripcion && (
                <div>
                  <p className="text-xs text-text-muted mb-1">Descripción</p>
                  <p className="text-sm text-text-primary leading-relaxed">{habitacion.descripcion}</p>
                </div>
              )}
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {/* Images trigger */}
              {habitacion.url_imagen && habitacion.url_imagen.length > 0 && (
                <button
                  onClick={() => { setCarouselIndex(0); setImageModalOpen(true); }}
                  className="w-full flex items-center justify-between bg-paper-medium/10 hover:bg-paper-medium/20 transition-colors rounded-xl px-4 py-3 border border-border/50 group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                      <MdImage className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-text-primary">Imágenes</p>
                      <p className="text-xs text-text-muted">{habitacion.url_imagen.length} foto{habitacion.url_imagen.length > 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <MdOpenInFull className="w-4 h-4 text-text-muted group-hover:text-accent-primary transition-colors" />
                </button>
              )}

              {/* Muebles */}
              {habitacion.muebles && habitacion.muebles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-text-muted">
                    <MdChair className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Muebles ({habitacion.muebles.length})</span>
                  </div>
                  <div className="space-y-2">
                    {habitacion.muebles.map((m) => (
                      <div key={m.id} className="flex items-center gap-3 bg-paper-medium/10 rounded-xl px-3 py-2.5">
                        {m.url_imagen ? (
                          <img src={m.url_imagen} alt={m.nombre} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-border" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-bg-tertiary/50 flex items-center justify-center shrink-0 text-text-muted text-xs font-bold">
                            {m.codigo.slice(0, 3)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">{m.nombre}</p>
                          <p className="text-xs text-text-muted">{m.categoria?.nombre ?? "—"} · {m.condicion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      {habitacion.url_imagen && habitacion.url_imagen.length > 0 && (
        <ImageCarousel
          images={habitacion.url_imagen}
          isOpen={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
          initialIndex={carouselIndex}
        />
      )}
      </div>
    </div>
  );
}
