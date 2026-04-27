import { useState, useEffect, useRef } from "react";
import { Modal, Button, InputField } from "@/components";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import type { Reserva, CreateReserva, UpdateReserva, EstadoReserva } from "../types";
import type { Huesped } from "@/features/clients/types";
import type { Habitacion } from "@/features/rooms/types";
import type { Tarifa } from "@/features/rates/types";
import { authClient } from "@/shared/lib/auth";
import { cn } from "@/shared/utils/cn";
import { 
  MdPerson, MdHotel, MdAttachMoney, MdCalendarToday, MdGroup, 
  MdChildCare, MdInfo, MdCalculate, MdEventNote, MdLocationOn,
  MdAccessTime, MdAccountBalance, MdTrendingUp, MdSearch
} from "react-icons/md";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reserva?: Reserva | null;
  tarifas: Tarifa[];
  onCreate: (data: CreateReserva) => Promise<Reserva>;
  onUpdate: (data: UpdateReserva) => Promise<Reserva>;
}

const ESTADO_OPTIONS = [
  { value: "TENTATIVA", label: "Tentativa", color: "text-warning", bgColor: "bg-warning-bg", icon: MdAccessTime },
  { value: "CONFIRMADA", label: "Confirmada", color: "text-success", bgColor: "bg-success-bg", icon: MdEventNote },
  { value: "EN_CASA", label: "En Casa", color: "text-info", bgColor: "bg-info-bg", icon: MdLocationOn },
  { value: "CANCELADA", label: "Cancelada", color: "text-danger", bgColor: "bg-danger-bg", icon: MdEventNote },
];

const selectClass = "field-input w-full rounded-xl py-3.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50";
const labelClass = "field-label block mb-2 text-text-secondary font-medium";
const toDateInput = (d?: string | Date | null) => d ? new Date(d).toISOString().slice(0, 10) : "";

export function ReservaModal({ isOpen, onClose, onSuccess, reserva, tarifas, onCreate, onUpdate }: Props) {
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const [form, setForm] = useState({
    huespedId: "", habitacionId: "", tarifaId: "",
    fecha_inicio: "", fecha_fin: "", adultos: "1", ninos: "0",
    estado: "TENTATIVA" as EstadoReserva,
  });
  const [saving, setSaving] = useState(false);

  // Guest search state
  const [huespedQuery, setHuespedQuery] = useState("");
  const [huespedSuggestions, setHuespedSuggestions] = useState<Huesped[]>([]);
  const [huespedSeleccionado, setHuespedSeleccionado] = useState<Huesped | null>(null);
  const [showHuespedSuggestions, setShowHuespedSuggestions] = useState(false);
  const [searchingHuesped, setSearchingHuesped] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Room search state
  const [habitacionQuery, setHabitacionQuery] = useState("");
  const [habitacionSuggestions, setHabitacionSuggestions] = useState<Habitacion[]>([]);
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState<Habitacion | null>(null);
  const [showHabitacionSuggestions, setShowHabitacionSuggestions] = useState(false);
  const [searchingHabitacion, setSearchingHabitacion] = useState(false);
  const habitacionSearchRef = useRef<HTMLInputElement>(null);
  const habitacionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const habitacionAbortControllerRef = useRef<AbortController | null>(null);

  const searchHuespedes = async (q: string) => {
    if (!q.trim()) {
      setHuespedSuggestions([]);
      setShowHuespedSuggestions(false);
      return;
    }
    
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    setSearchingHuesped(true);
    try {
      const { huespedesApi } = await import("@/features/clients/api");
      const data = await huespedesApi.getByNombre(q, abortControllerRef.current.signal);
      setHuespedSuggestions(data);
      setShowHuespedSuggestions(true);
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error searching huespedes:', error);
        setHuespedSuggestions([]);
        setShowHuespedSuggestions(false);
      }
    } finally {
      setSearchingHuesped(false);
    }
  };

  const searchHabitaciones = async (q: string) => {
    if (!q.trim()) {
      setHabitacionSuggestions([]);
      setShowHabitacionSuggestions(false);
      return;
    }
    
    // Cancel previous request
    if (habitacionAbortControllerRef.current) {
      habitacionAbortControllerRef.current.abort();
    }
    
    // Create new abort controller
    habitacionAbortControllerRef.current = new AbortController();
    
    setSearchingHabitacion(true);
    try {
      const { roomsApi } = await import("@/features/rooms/api");
      const data = await roomsApi.getByNumero(q, habitacionAbortControllerRef.current.signal);
      setHabitacionSuggestions(data);
      setShowHabitacionSuggestions(true);
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error searching habitaciones:', error);
        setHabitacionSuggestions([]);
        setShowHabitacionSuggestions(false);
      }
    } finally {
      setSearchingHabitacion(false);
    }
  };

  const handleHuespedQueryChange = (q: string) => {
    setHuespedQuery(q);
    setHuespedSeleccionado(null);
    setForm(prev => ({ ...prev, huespedId: "" }));
    setShowHuespedSuggestions(true);
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchHuespedes(q), 300);
  };

  const handleSelectHuesped = (huesped: Huesped) => {
    setHuespedSeleccionado(huesped);
    setHuespedQuery(`${huesped.nombres} ${huesped.apellidos}`);
    setForm(prev => ({ ...prev, huespedId: huesped.id }));
    setShowHuespedSuggestions(false);
  };

  const handleHabitacionQueryChange = (q: string) => {
    setHabitacionQuery(q);
    setHabitacionSeleccionada(null);
    setForm(prev => ({ ...prev, habitacionId: "" }));
    setShowHabitacionSuggestions(true);
    
    if (habitacionDebounceRef.current) clearTimeout(habitacionDebounceRef.current);
    habitacionDebounceRef.current = setTimeout(() => searchHabitaciones(q), 300);
  };

  const handleSelectHabitacion = (habitacion: Habitacion) => {
    setHabitacionSeleccionada(habitacion);
    setHabitacionQuery(`Hab. ${habitacion.nro_habitacion}`);
    setForm(prev => ({ ...prev, habitacionId: habitacion.id }));
    setShowHabitacionSuggestions(false);
  };

  useEffect(() => {
    if (reserva) {
      setForm({
        huespedId: reserva.huespedId,
        habitacionId: reserva.habitacionId,
        tarifaId: reserva.tarifaId,
        fecha_inicio: toDateInput(reserva.fecha_inicio),
        fecha_fin: toDateInput(reserva.fecha_fin),
        adultos: String(reserva.adultos),
        ninos: String(reserva.ninos),
        estado: reserva.estado,
      });
      // For editing, we need to load the guest info if we have the name
      if (reserva.nombre_huesped) {
        setHuespedQuery(reserva.nombre_huesped);
        // We'll create a minimal huesped object for display
        setHuespedSeleccionado({
          id: reserva.huespedId,
          nombres: reserva.nombre_huesped.split(' ')[0] || '',
          apellidos: reserva.nombre_huesped.split(' ').slice(1).join(' ') || '',
          tipo_doc: 'DNI',
          nro_doc: '',
          email: '',
          telefono: '',
          nacionalidad: '',
          observacion: '',
          created_at: new Date(),
          updated_at: new Date()
        });
      }

      if (reserva.nro_habitacion) {
        setHabitacionQuery(`Hab. ${reserva.nro_habitacion}`);
        setHabitacionSeleccionada({
          id: reserva.habitacionId,
          nro_habitacion: reserva.nro_habitacion,
          piso: 0, 
          tipo_habitacion_id: '',
          tiene_ducha: false,
          tiene_banio: false,
          estado: true,
          descripcion: null,
          url_imagen: null,
          promociones: [],
          tipo_habitacion: {
            id: '',
            nombre: reserva.nombre_tipo_hab || '',
            created_at: new Date(),
            updated_at: new Date()
          },
          fechas_reserva: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } else {
      setForm({
        huespedId: "", habitacionId: "",
        tarifaId: tarifas[0]?.id ?? "", fecha_inicio: "", fecha_fin: "",
        adultos: "1", ninos: "0", estado: "TENTATIVA",
      });
      setHuespedSeleccionado(null);
      setHuespedQuery("");
      setHabitacionSeleccionada(null);
      setHabitacionQuery("");
    }
  }, [reserva, isOpen, tarifas]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (habitacionAbortControllerRef.current) {
        habitacionAbortControllerRef.current.abort();
      }
      if (habitacionDebounceRef.current) {
        clearTimeout(habitacionDebounceRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fecha_inicio || !form.fecha_fin) return sileo.error({ title: "Error", description: "Las fechas son requeridas" });
    if (new Date(form.fecha_fin) <= new Date(form.fecha_inicio)) return sileo.error({ title: "Error", description: "La fecha de salida debe ser posterior a la entrada" });

    setSaving(true);
    try {
      if (reserva) {
        const updatePayload: UpdateReserva = {
          huespedId: form.huespedId,
          habitacionId: form.habitacionId,
          tarifaId: form.tarifaId,
          fechaInicio: new Date(form.fecha_inicio).toISOString().split('T')[0],
          fechaFin: new Date(form.fecha_fin).toISOString().split('T')[0],
          adultos: parseInt(form.adultos) || 1,
          ninos: parseInt(form.ninos) || 0,
          ...(isAdmin && { estado: form.estado }),
        };
        await onUpdate(updatePayload);
      } else {
        const createPayload: CreateReserva = {
          huespedId: form.huespedId,
          habitacionId: form.habitacionId,
          tarifaId: form.tarifaId,
          fechaInicio: new Date(form.fecha_inicio).toISOString().split('T')[0],
          fechaFin: new Date(form.fecha_fin).toISOString().split('T')[0],
          adultos: parseInt(form.adultos) || 1,
          ninos: parseInt(form.ninos) || 0,
        };
        await onCreate(createPayload);
      }
      sileo.success({ title: reserva ? "Reserva actualizada" : "Reserva creada" });
      onSuccess();
      onClose();
    } catch (err) {
      if (!isHandledError(err)) { sileo.error({ title: "Error", description: "No se pudo guardar la reserva" }); }
    } finally {
      setSaving(false);
    }
  };

  const noches = form.fecha_inicio && form.fecha_fin
    ? Math.max(0, Math.ceil((new Date(form.fecha_fin).getTime() - new Date(form.fecha_inicio).getTime()) / 86400000))
    : 0;

  const tarifaSeleccionada = tarifas.find((t) => t.id === form.tarifaId);
  const habitacionEncontrada = habitacionSeleccionada;
  const estadoSeleccionado = ESTADO_OPTIONS.find((e) => e.value === form.estado);
  const montoBase = tarifaSeleccionada ? tarifaSeleccionada.precio * noches : 0;
  const total = Math.max(0, montoBase);
  const totalHuespedes = parseInt(form.adultos) + parseInt(form.ninos);

  const isFormValid = form.huespedId && form.habitacionId && form.tarifaId && form.fecha_inicio && form.fecha_fin && noches > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={reserva ? "Editar Reserva" : "Nueva Reserva"} size="2xl">
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-custom">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* ── Header con resumen visual ── */}
          {(huespedSeleccionado || habitacionEncontrada || noches > 0) && (
            <div className="bg-gradient-to-r from-accent-primary/5 via-primary/5 to-accent-light/5 border border-accent-primary/20 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent-primary/20 flex items-center justify-center">
                    <MdHotel className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">
                      {huespedSeleccionado 
                        ? `${huespedSeleccionado.nombres} ${huespedSeleccionado.apellidos}` 
                        : "Nueva Reserva"}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-text-muted">
                      {habitacionEncontrada && (
                        <div className="flex items-center gap-1">
                          <MdLocationOn className="w-4 h-4" />
                          <span>Hab. {habitacionEncontrada.nro_habitacion}</span>
                        </div>
                      )}
                      {noches > 0 && (
                        <div className="flex items-center gap-1">
                          <MdCalendarToday className="w-4 h-4" />
                          <span>{noches} noche{noches !== 1 ? "s" : ""}</span>
                        </div>
                      )}
                      {totalHuespedes > 0 && (
                        <div className="flex items-center gap-1">
                          <MdGroup className="w-4 h-4" />
                          <span>{totalHuespedes} huésped{totalHuespedes !== 1 ? "es" : ""}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {estadoSeleccionado && (
                    <div className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-2",
                      estadoSeleccionado.bgColor, estadoSeleccionado.color
                    )}>
                      <estadoSeleccionado.icon className="w-3 h-3" />
                      {estadoSeleccionado.label}
                    </div>
                  )}
                  {total > 0 && tarifaSeleccionada && (
                    <div>
                      <p className="text-2xl font-bold text-accent-primary">
                        {tarifaSeleccionada.moneda} {total.toFixed(2)}
                      </p>
                      <p className="text-xs text-text-muted">Total estimado</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Layout en tres columnas ── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Columna 1: Información básica */}
            <div className="space-y-6">
              
              {/* ── Huésped y habitación ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-text-muted pb-3 border-b border-border/50">
                  <MdPerson className="w-5 h-5" />
                  <span className="text-sm font-semibold uppercase tracking-wide">Información Básica</span>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <MdPerson className="w-4 h-4 text-text-muted" />
                      <label className={labelClass}>Huésped *</label>
                    </div>
                    <div className="relative">
                      <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        ref={searchRef}
                        type="text"
                        value={huespedQuery}
                        onChange={(e) => handleHuespedQueryChange(e.target.value)}
                        onFocus={() => setShowHuespedSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowHuespedSuggestions(false), 150)}
                        placeholder="Buscar huésped por nombre..."
                        className={cn(
                          selectClass, 
                          "pl-9", 
                          huespedSeleccionado ? "border-success/40 bg-success-bg/40" : ""
                        )}
                        required
                      />
                    </div>

                    {showHuespedSuggestions && (searchingHuesped || huespedSuggestions.length > 0 || (huespedQuery.trim() && !searchingHuesped)) && (
                      <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto scrollbar-custom">
                        {searchingHuesped ? (
                          <div className="px-4 py-6 text-center">
                            <div className="inline-block w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <p className="text-xs text-text-muted mt-2">Buscando huéspedes...</p>
                          </div>
                        ) : huespedSuggestions.length > 0 ? (
                          huespedSuggestions.map((h) => (
                            <button
                              key={h.id}
                              type="button"
                              onMouseDown={() => handleSelectHuesped(h)}
                              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-bg-hover transition-colors text-left border-b border-border/50 last:border-0"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-text-primary font-medium">{h.nombres} {h.apellidos}</p>
                                <p className="text-xs text-text-muted">
                                  {h.tipo_doc}: {h.nro_doc} • {h.email}
                                </p>
                                {h.telefono && (
                                  <p className="text-xs text-text-muted">Tel: {h.telefono}</p>
                                )}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-center">
                            <MdPerson className="w-8 h-8 text-text-muted mx-auto mb-2" />
                            <p className="text-sm text-text-muted">No se encontraron huéspedes</p>
                            <p className="text-xs text-text-muted mt-1">
                              Intenta con otro nombre o crea un nuevo huésped
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <MdHotel className="w-4 h-4 text-text-muted" />
                      <label className={labelClass}>Habitación *</label>
                    </div>
                    <div className="relative">
                      <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input
                        ref={habitacionSearchRef}
                        type="text"
                        value={habitacionQuery}
                        onChange={(e) => handleHabitacionQueryChange(e.target.value)}
                        onFocus={() => setShowHabitacionSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowHabitacionSuggestions(false), 150)}
                        placeholder="Buscar habitación por número..."
                        className={cn(
                          selectClass, 
                          "pl-9", 
                          habitacionSeleccionada ? "border-success/40 bg-success-bg/40" : ""
                        )}
                        required
                      />
                    </div>

                    {showHabitacionSuggestions && (searchingHabitacion || habitacionSuggestions.length > 0 || (habitacionQuery.trim() && !searchingHabitacion)) && (
                      <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto scrollbar-custom">
                        {searchingHabitacion ? (
                          <div className="px-4 py-6 text-center">
                            <div className="inline-block w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <p className="text-xs text-text-muted mt-2">Buscando habitaciones...</p>
                          </div>
                        ) : habitacionSuggestions.length > 0 ? (
                          habitacionSuggestions.map((h) => (
                            <button
                              key={h.id}
                              type="button"
                              onMouseDown={() => handleSelectHabitacion(h)}
                              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-bg-hover transition-colors text-left border-b border-border/50 last:border-0"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-text-primary font-medium">Hab. {h.nro_habitacion}</p>
                                <p className="text-xs text-text-muted">
                                  Piso {h.piso} • {h.tipo_habitacion?.nombre || "Sin tipo"}
                                </p>
                                {h.descripcion && (
                                  <p className="text-xs text-text-muted">{h.descripcion}</p>
                                )}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-center">
                            <MdHotel className="w-8 h-8 text-text-muted mx-auto mb-2" />
                            <p className="text-sm text-text-muted">No se encontraron habitaciones</p>
                            <p className="text-xs text-text-muted mt-1">
                              Intenta con otro número de habitación
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Vista previa de selección */}
                {(huespedSeleccionado || habitacionEncontrada) && (
                  <div className="bg-success-bg/20 border border-success/20 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <MdInfo className="w-4 h-4 text-success" />
                      <span className="text-xs font-medium text-success">Selección actual</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      {huespedSeleccionado && (
                        <div className="grid grid-cols-2 gap-x-4">
                          <span className="text-text-muted">Huésped</span>
                          <span className="text-text-primary font-medium">
                            {huespedSeleccionado.nombres} {huespedSeleccionado.apellidos}
                          </span>
                          <span className="text-text-muted">Documento</span>
                          <span className="text-text-primary">{huespedSeleccionado.tipo_doc}: {huespedSeleccionado.nro_doc}</span>
                        </div>
                      )}
                      {habitacionEncontrada && (
                        <div className="grid grid-cols-2 gap-x-4 pt-2 border-t border-success/20">
                          <span className="text-text-muted">Habitación</span>
                          <span className="text-text-primary font-medium">Nro. {habitacionEncontrada.nro_habitacion}</span>
                          <span className="text-text-muted">Ubicación</span>
                          <span className="text-text-primary">Piso {habitacionEncontrada.piso}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Estado (solo para admin y edición) ── */}
              {reserva && isAdmin && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-text-muted pb-3 border-b border-border/50">
                    <MdEventNote className="w-5 h-5" />
                    <span className="text-sm font-semibold uppercase tracking-wide">Estado de la Reserva</span>
                  </div>

                  <div>
                    <label className={labelClass}>Estado *</label>
                    <div className="relative">
                      <select 
                        value={form.estado} 
                        onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value as EstadoReserva }))} 
                        className={selectClass}
                      >
                        {ESTADO_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {estadoSeleccionado && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <estadoSeleccionado.icon className={cn("w-4 h-4", estadoSeleccionado.color)} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Columna 2: Fechas y ocupación */}
            <div className="space-y-6">
              
              {/* ── Fechas de estadía ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-text-muted pb-3 border-b border-border/50">
                  <MdCalendarToday className="w-5 h-5" />
                  <span className="text-sm font-semibold uppercase tracking-wide">Fechas de Estadía</span>
                </div>

                <div className="space-y-4">
                  <InputField 
                    label="Fecha de entrada *" 
                    type="date" 
                    value={form.fecha_inicio} 
                    onChange={(e) => setForm((f) => ({ ...f, fecha_inicio: e.target.value }))} 
                    required 
                  />
                  
                  <InputField 
                    label="Fecha de salida *" 
                    type="date" 
                    value={form.fecha_fin} 
                    onChange={(e) => setForm((f) => ({ ...f, fecha_fin: e.target.value }))} 
                    required 
                  />
                </div>

                {/* Resumen de fechas */}
                {form.fecha_inicio && form.fecha_fin && noches > 0 && (
                  <div className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <MdAccessTime className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium text-primary">Duración de estadía</span>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{noches}</p>
                      <p className="text-xs text-text-muted">noche{noches !== 1 ? "s" : ""}</p>
                      <div className="text-xs text-text-muted mt-2 space-y-1">
                        <p>Entrada: {new Date(form.fecha_inicio).toLocaleDateString('es-PE')}</p>
                        <p>Salida: {new Date(form.fecha_fin).toLocaleDateString('es-PE')}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Ocupación ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-text-muted pb-3 border-b border-border/50">
                  <MdGroup className="w-5 h-5" />
                  <span className="text-sm font-semibold uppercase tracking-wide">Ocupación</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <InputField 
                      label="Adultos *" 
                      type="number" 
                      min={1} 
                      value={form.adultos} 
                      onChange={(e) => setForm((f) => ({ ...f, adultos: e.target.value }))} 
                      required 
                    />
                    <MdGroup className="absolute right-3 top-9 w-4 h-4 text-text-muted pointer-events-none" />
                  </div>
                  
                  <div className="relative">
                    <InputField 
                      label="Niños" 
                      type="number" 
                      min={0} 
                      value={form.ninos} 
                      onChange={(e) => setForm((f) => ({ ...f, ninos: e.target.value }))} 
                    />
                    <MdChildCare className="absolute right-3 top-9 w-4 h-4 text-text-muted pointer-events-none" />
                  </div>
                </div>

                {totalHuespedes > 0 && (
                  <div className="bg-info-bg/20 border border-info/20 rounded-xl px-4 py-3 text-center">
                    <p className="text-lg font-semibold text-info">{totalHuespedes}</p>
                    <p className="text-xs text-text-muted">huésped{totalHuespedes !== 1 ? "es" : ""} total{totalHuespedes !== 1 ? "es" : ""}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Columna 3: Tarifa y cálculos */}
            <div className="space-y-6">
              
              {/* ── Tarifa ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-text-muted pb-3 border-b border-border/50">
                  <MdAttachMoney className="w-5 h-5" />
                  <span className="text-sm font-semibold uppercase tracking-wide">Tarifa y Precios</span>
                </div>

                <div>
                  <label className={labelClass}>Tarifa *</label>
                  <select 
                    value={form.tarifaId} 
                    onChange={(e) => setForm((f) => ({ ...f, tarifaId: e.target.value }))} 
                    className={cn(selectClass, tarifaSeleccionada ? "border-success/40 bg-success-bg/40" : "")}
                    required
                  >
                    <option value="">Seleccionar tarifa...</option>
                    {tarifas.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.tipo_habitacion?.nombre} — {t.canal?.nombre} ({t.moneda} {t.precio}/{t.unidad})
                      </option>
                    ))}
                  </select>
                </div>

                {tarifaSeleccionada && (
                  <div className="bg-success-bg/20 border border-success/20 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <MdAccountBalance className="w-4 h-4 text-success" />
                      <span className="text-xs font-medium text-success">Tarifa seleccionada</span>
                    </div>
                    <div className="text-xs grid grid-cols-2 gap-x-4 gap-y-1">
                      <span className="text-text-muted">Tipo habitación</span>
                      <span className="text-text-primary font-medium">{tarifaSeleccionada.tipo_habitacion?.nombre}</span>
                      <span className="text-text-muted">Canal</span>
                      <span className="text-text-primary">{tarifaSeleccionada.canal?.nombre}</span>
                      <span className="text-text-muted">Precio por {tarifaSeleccionada.unidad}</span>
                      <span className="text-text-primary font-medium">{tarifaSeleccionada.moneda} {tarifaSeleccionada.precio}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Cálculo de costos ── */}
              {noches > 0 && tarifaSeleccionada && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-text-muted pb-3 border-b border-border/50">
                    <MdCalculate className="w-5 h-5" />
                    <span className="text-sm font-semibold uppercase tracking-wide">Cálculo de Costos</span>
                  </div>

                  <div className="bg-gradient-to-br from-accent-primary/10 to-accent-light/10 border border-accent-primary/20 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-text-muted">
                          {noches} noche{noches !== 1 ? "s" : ""} × {tarifaSeleccionada.moneda} {tarifaSeleccionada.precio}
                        </span>
                        <span className="font-medium text-text-primary">
                          {tarifaSeleccionada.moneda} {montoBase.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-accent-primary/20 border-t border-accent-primary/30 px-4 py-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <MdTrendingUp className="w-5 h-5 text-accent-primary" />
                          <span className="font-semibold text-accent-primary">Total Estimado</span>
                        </div>
                        <span className="text-xl font-bold text-accent-primary">
                          {tarifaSeleccionada.moneda} {total.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-1">
                        * Los precios pueden variar según promociones y servicios adicionales
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Información adicional ── */}
              {!tarifaSeleccionada && (
                <div className="bg-warning-bg/20 border border-warning/20 rounded-xl px-4 py-6 text-center">
                  <MdInfo className="w-12 h-12 text-warning mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-text-primary mb-2">Selecciona una tarifa</h3>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Para ver el cálculo de costos y completar la reserva, 
                    selecciona una tarifa que corresponda al tipo de habitación.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-4 pt-6 border-t border-border/50 sticky bottom-0 bg-bg-card">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1" disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={saving} className="flex-1" disabled={!isFormValid}>
              {reserva ? "Actualizar Reserva" : "Crear Reserva"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
