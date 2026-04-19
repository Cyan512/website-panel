import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { createChart, LineSeries, ColorType, CrosshairMode } from 'lightweight-charts';
import type { IChartApi, Time, ISeriesApi } from 'lightweight-charts';

const STATIC_DATA = [
  { time: '2026-02-18', value: 180 },
  { time: '2026-03-18', value: 10 },
  { time: '2026-03-19', value: 50 },
];

interface TooltipData {
  date: string;
  value: number;
  x: number;
  y: number;
}

type FilterType = 'day' | 'week' | 'month' | 'year' | 'custom';

const MONTHS_ES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function formatDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function Ingresos() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const [filter, setFilter] = useState<FilterType>('week');
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const today = new Date();
  const startOfWeek = getStartOfWeek(today);

  const [selectedDate, setSelectedDate] = useState(formatDateStr(today));
  const [weekStart, setWeekStart] = useState(formatDateStr(startOfWeek));
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [customStart, setCustomStart] = useState(formatDateStr(today));
  const [customEnd, setCustomEnd] = useState(formatDateStr(today));

  const getFilteredData = useCallback(() => {
    const filtered = STATIC_DATA.filter((d: { time: string; value: number }) => {
      const [year, month, day] = d.time.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      switch (filter) {
        case 'day': {
          const [sy, sm, sd] = selectedDate.split('-').map(Number);
          const selected = new Date(sy, sm - 1, sd);
          return date.getTime() === selected.getTime();
        }
        case 'week': {
          const [sy, sm, sd] = weekStart.split('-').map(Number);
          const start = new Date(sy, sm - 1, sd);
          const end = new Date(start);
          end.setDate(end.getDate() + 13);
          return date >= start && date <= end;
        }
        case 'month':
          return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
        case 'year':
          return date.getFullYear() === selectedYear;
        case 'custom': {
          const [sy1, sm1, sd1] = customStart.split('-').map(Number);
          const [sy2, sm2, sd2] = customEnd.split('-').map(Number);
          const start = new Date(sy1, sm1 - 1, sd1);
          const end = new Date(sy2, sm2 - 1, sd2);
          return date >= start && date <= end;
        }
        default:
          return true;
      }
    });
    return filtered.sort((a: { time: string }, b: { time: string }) => a.time.localeCompare(b.time));
  }, [filter, selectedDate, weekStart, selectedMonth, selectedYear, customStart, customEnd]);

  const filteredData = useMemo(() => getFilteredData(), [getFilteredData]);
  const totalIngresos = useMemo(() => filteredData.reduce((sum: number, d: { value: number }) => sum + d.value, 0), [filteredData]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 200,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(148, 163, 184, 0.08)' },
        horzLines: { color: 'rgba(148, 163, 184, 0.08)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      leftPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        tickMarkFormatter: (time: Time) => {
          const dateStr = time as string;
          const [year, month, day] = dateStr.split('-').map(Number);
          const date = new Date(year, month - 1, day);
          return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        },
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    const lineSeries = chart.addSeries(LineSeries, {
      color: '#10b981',
      lineWidth: 2,
      priceFormat: {
        type: 'custom',
        formatter: (price: number) => `$${price.toFixed(0)}`,
      },
    });

    lineSeries.setData(filteredData.map((d: { time: string; value: number }) => ({ time: d.time, value: d.value })));
    chartRef.current = chart;
    seriesRef.current = lineSeries;

    chart.subscribeCrosshairMove((param) => {
      if (param.time && param.seriesData.size > 0) {
        const data = param.seriesData.get(lineSeries);
        if (data && 'value' in data) {
          const dateStr = param.time as string;
          const [year, month, day] = dateStr.split('-').map(Number);
          const date = new Date(year, month - 1, day);
          const formattedDate = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
          setTooltip({
            date: formattedDate,
            value: data.value as number,
            x: param.point?.x || 0,
            y: param.point?.y || 0,
          });
        }
      } else {
        setTooltip(null);
      }
    });

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const timeScale = chart.timeScale();
      timeScale.applyOptions({
        rightOffset: timeScale.scrollPosition() + (e.deltaY > 0 ? 5 : -5),
      });
    };

    const container = chartContainerRef.current;
    container.addEventListener('wheel', handleWheel, { passive: false });

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('wheel', handleWheel);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current && chartRef.current && filteredData.length > 0) {
      seriesRef.current.setData(filteredData.map((d: { time: string; value: number }) => ({ time: d.time, value: d.value })));
      if (filteredData.length > 1) {
        chartRef.current.timeScale().fitContent();
      } else {
        chartRef.current.timeScale().setVisibleRange({
          from: filteredData[0].time as Time,
          to: filteredData[0].time as Time,
        });
      }
    }
  }, [filter, filteredData]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    STATIC_DATA.forEach((d) => {
      const year = parseInt(d.time.split('-')[0]);
      years.add(year);
    });
    return Array.from(years).sort();
  }, []);

  const getDateLabel = () => {
    switch (filter) {
      case 'day': {
        const [y, m, d] = selectedDate.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
      }
      case 'week': {
        const [y1, m1, d1] = weekStart.split('-').map(Number);
        const start = new Date(y1, m1 - 1, d1);
        const end = new Date(start);
        end.setDate(end.getDate() + 13);
        return `${start.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      }
      case 'month':
        return `${MONTHS_ES[selectedMonth]} ${selectedYear}`;
      case 'year':
        return `${selectedYear}`;
      case 'custom': {
        const [y1, m1, d1] = customStart.split('-').map(Number);
        const [y2, m2, d2] = customEnd.split('-').map(Number);
        const start = new Date(y1, m1 - 1, d1);
        const end = new Date(y2, m2 - 1, d2);
        return `${start.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;
      }
      default:
        return '';
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-text-primary">Ingresos</h3>
          <p className="text-sm text-text-muted mt-0.5">Resumen de ingresos · Scroll para hacer zoom</p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          {/* Total */}
          <div className="sm:text-right">
            <p className="text-2xl font-bold text-emerald-500">
              ${totalIngresos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-text-muted">{getDateLabel()}</p>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="bg-bg-secondary text-text-primary text-sm rounded-lg px-3 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="day">Día</option>
              <option value="week">Semana</option>
              <option value="month">Mes</option>
              <option value="year">Año</option>
              <option value="custom">Personalizado</option>
            </select>

            {filter === 'day' && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-bg-secondary text-text-primary text-sm rounded-lg px-3 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            )}
            {filter === 'week' && (
              <input
                type="date"
                value={weekStart}
                onChange={(e) => setWeekStart(e.target.value)}
                className="bg-bg-secondary text-text-primary text-sm rounded-lg px-3 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            )}
            {filter === 'month' && (
              <>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="bg-bg-secondary text-text-primary text-sm rounded-lg px-3 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {MONTHS_ES.map((month, i) => (
                    <option key={i} value={i}>{month}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="bg-bg-secondary text-text-primary text-sm rounded-lg px-3 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </>
            )}
            {filter === 'year' && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-bg-secondary text-text-primary text-sm rounded-lg px-3 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            )}
            {filter === 'custom' && (
              <>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="bg-bg-secondary text-text-primary text-sm rounded-lg px-3 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-text-muted text-sm">—</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="bg-bg-secondary text-text-primary text-sm rounded-lg px-3 py-2 border border-border focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <div ref={chartContainerRef} className="w-full" />
        {tooltip && (
          <div
            className="absolute pointer-events-none bg-card px-3 py-2 rounded-lg shadow-lg border border-border z-10"
            style={{ left: tooltip.x + 10, top: tooltip.y - 40 }}
          >
            <p className="text-xs text-text-muted">{tooltip.date}</p>
            <p className="text-lg font-bold text-emerald-500">${tooltip.value.toLocaleString('es-ES')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
