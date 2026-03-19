import { useEffect, useRef } from 'react';
import { createChart, LineSeries, ColorType, CrosshairMode } from 'lightweight-charts';
import type { IChartApi, Time } from 'lightweight-charts';

function generateWeekData() {
  return [
    { time: '2026-02-18', value: 180 },
    { time: '2026-03-19', value: 50 },
    { time: '2026-03-20', value: 10 },
  ];
}

export default function Ingresos() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const weekData = generateWeekData();
  const totalIngresos = weekData.reduce((sum, d) => sum + d.value, 0);

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
          const date = new Date(time as string);
          return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }).slice(0, 6);
        },
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

    lineSeries.setData(weekData.map(d => ({ time: d.time, value: d.value })));
    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-text-primary">Ingresos de la Semana</h3>
          <p className="text-sm text-text-muted mt-0.5">Resumen semanal de ingresos</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-500">
            ${totalIngresos.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-text-muted">Total semanal</p>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}
