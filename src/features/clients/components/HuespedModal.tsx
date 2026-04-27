import { useState, useEffect } from "react";
import { useHuespedes } from "../hooks/useHuespedes";
import type { CreateHuesped, UpdateHuesped, Huesped, TipoDocumento } from "../types";
import { Modal, Button } from "@/components";
import { InputField } from "@/components";
import { sileo } from "sileo";
import { isHandledError } from "@/shared/utils/error";
import { cn } from "@/shared/utils/cn";
import { MdPerson, MdContactMail, MdPhone, MdEmail, MdPublic, MdNotes, MdBadge, MdVerifiedUser } from "react-icons/md";

const TIPO_DOC: { value: TipoDocumento; label: string; icon: any; color: string }[] = [
  { value: "DNI", label: "DNI", icon: MdBadge, color: "text-primary" },
  { value: "PASAPORTE", label: "Pasaporte", icon: MdVerifiedUser, color: "text-success" },
  { value: "RUC", label: "RUC", icon: MdContactMail, color: "text-warning" },
  { value: "CE", label: "Carné de Extranjería", icon: MdPublic, color: "text-info" },
];

const NACIONALIDADES_COMUNES = [
  "Peruana", "Argentina", "Brasileña", "Chilena", "Colombiana", "Ecuatoriana", 
  "Boliviana", "Venezolana", "Uruguaya", "Paraguaya", "Estadounidense", 
  "Canadiense", "Mexicana", "Española", "Francesa", "Italiana", "Alemana", 
  "Británica", "Japonesa", "China", "Coreana", "Australiana", "Otra"
];

const defaultFormData = {
  tipo_doc: "",
  nro_doc: "",
  nombres: "",
  apellidos: "",
  email: "",
  telefono: "",
  nacionalidad: "",
  observacion: "",
};

const selectClass = "field-input w-full rounded-xl py-3.5 px-3.5 focus:outline-none focus:ring-2 focus:ring-accent-primary/30 focus:border-accent-primary border border-border-light/50";
const labelClass = "field-label block mb-2 text-text-secondary font-medium";

interface HuespedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  huesped?: Huesped | null;
}

export function HuespedModal({ isOpen, onClose, onSuccess, huesped }: HuespedModalProps) {
  const { createHuesped, updateHuesped } = useHuespedes();
  const isEditing = !!huesped;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (huesped) {
      setFormData({
        tipo_doc: huesped.tipo_doc || "",
        nro_doc: huesped.nro_doc || "",
        nombres: huesped.nombres || "",
        apellidos: huesped.apellidos || "",
        email: huesped.email || "",
        telefono: huesped.telefono || "",
        nacionalidad: huesped.nacionalidad || "",
        observacion: huesped.observacion || "",
      });
    } else {
      setFormData(defaultFormData);
    }
  }, [huesped]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      
      if (isEditing && huesped) {
        const updateData: UpdateHuesped = {
          tipo_doc: formData.tipo_doc.trim(),
          nro_doc: formData.nro_doc.trim(),
          nombres: formData.nombres.trim(),
          apellidos: formData.apellidos.trim(),
          email: formData.email.trim(),
          telefono: formData.telefono.trim(),
          nacionalidad: formData.nacionalidad.trim(),
          observacion: formData.observacion.trim(),
        };
        await updateHuesped(huesped.id, updateData);
      } else {
        const createData: CreateHuesped = {
          tipo_doc: formData.tipo_doc.trim(),
          nro_doc: formData.nro_doc.trim(),
          nombres: formData.nombres.trim(),
          apellidos: formData.apellidos.trim(),
          email: formData.email.trim(),
          telefono: formData.telefono.trim(),
          nacionalidad: formData.nacionalidad.trim(),
          observacion: formData.observacion.trim(),
        };
        await createHuesped(createData);
      }
      onSuccess();
      onClose();
    } catch (error: unknown) {
      if (!isHandledError(error)) {
        const message = error && typeof error === 'object' && 'response' in error 
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || "No se pudo guardar el huésped"
          : "No se pudo guardar el huésped";
        sileo.error({ title: "Error", description: message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof typeof defaultFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const selectedTipoDoc = TIPO_DOC.find(tipo => tipo.value === formData.tipo_doc);
  const isFormValid = formData.nombres.trim() && formData.apellidos.trim() && formData.email.trim() && formData.telefono.trim() && formData.tipo_doc && formData.nro_doc.trim() && formData.nacionalidad.trim();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Editar Huésped" : "Nuevo Huésped"} size="2xl">
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-custom">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* ── Header con resumen visual ── */}
          {(formData.nombres || formData.apellidos || selectedTipoDoc) && (
            <div className="bg-gradient-to-r from-accent-primary/5 via-primary/5 to-accent-light/5 border border-accent-primary/20 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent-primary/20 flex items-center justify-center">
                    <MdPerson className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">
                      {formData.nombres || formData.apellidos 
                        ? `${formData.nombres} ${formData.apellidos}`.trim() 
                        : "Nuevo Huésped"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedTipoDoc && (
                        <>
                          <selectedTipoDoc.icon className={cn("w-4 h-4", selectedTipoDoc.color)} />
                          <span className="text-sm text-text-muted">
                            {selectedTipoDoc.label}: {formData.nro_doc || "Sin documento"}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
                    isFormValid 
                      ? "bg-success-bg text-success" 
                      : "bg-warning-bg text-warning"
                  )}>
                    <div className={cn("w-2 h-2 rounded-full", isFormValid ? "bg-success" : "bg-warning")} />
                    {isFormValid ? "Información completa" : "Faltan datos"}
                  </div>
                  {formData.nacionalidad && (
                    <p className="text-xs text-text-muted mt-1">
                      <MdPublic className="inline w-3 h-3 mr-1" />
                      {formData.nacionalidad}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Layout en dos columnas ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Columna 1: Información personal */}
            <div className="space-y-6">
              
              {/* ── Identificación ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-text-muted pb-3 border-b border-border/50">
                  <MdBadge className="w-5 h-5" />
                  <span className="text-sm font-semibold uppercase tracking-wide">Identificación</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Tipo de Documento *</label>
                    <div className="relative">
                      <select
                        value={formData.tipo_doc}
                        onChange={(e) => handleChange("tipo_doc", e.target.value)}
                        className={selectClass}
                        required
                      >
                        <option value="">Seleccione un tipo</option>
                        {TIPO_DOC.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      {selectedTipoDoc && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <selectedTipoDoc.icon className={cn("w-4 h-4", selectedTipoDoc.color)} />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <InputField 
                    label="Número de Documento *" 
                    value={formData.nro_doc} 
                    onChange={(e) => handleChange("nro_doc", e.target.value)} 
                    placeholder="Ej: 12345678" 
                    required 
                    maxLength={20} 
                  />
                </div>
              </div>

              {/* ── Datos personales ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-text-muted pb-3 border-b border-border/50">
                  <MdPerson className="w-5 h-5" />
                  <span className="text-sm font-semibold uppercase tracking-wide">Datos Personales</span>
                </div>

                <div className="space-y-4">
                  <InputField 
                    label="Nombres *" 
                    value={formData.nombres} 
                    onChange={(e) => handleChange("nombres", e.target.value)} 
                    placeholder="Ej: Juan Carlos" 
                    required 
                    maxLength={80} 
                  />
                  
                  <InputField 
                    label="Apellidos *" 
                    value={formData.apellidos} 
                    onChange={(e) => handleChange("apellidos", e.target.value)} 
                    placeholder="Ej: Pérez García" 
                    required 
                    maxLength={80} 
                  />

                  <div>
                    <label className={labelClass}>Nacionalidad *</label>
                    <div className="relative">
                      <select
                        value={formData.nacionalidad}
                        onChange={(e) => handleChange("nacionalidad", e.target.value)}
                        className={selectClass}
                        required
                      >
                        <option value="">Seleccione nacionalidad</option>
                        {NACIONALIDADES_COMUNES.map((nac) => (
                          <option key={nac} value={nac}>{nac}</option>
                        ))}
                      </select>
                      <MdPublic className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna 2: Información de contacto y observaciones */}
            <div className="space-y-6">
              
              {/* ── Información de contacto ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-text-muted pb-3 border-b border-border/50">
                  <MdContactMail className="w-5 h-5" />
                  <span className="text-sm font-semibold uppercase tracking-wide">Información de Contacto</span>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <InputField 
                      label="Email *" 
                      type="email" 
                      value={formData.email} 
                      onChange={(e) => handleChange("email", e.target.value)} 
                      placeholder="correo@ejemplo.com" 
                      required 
                      maxLength={120} 
                    />
                    <MdEmail className="absolute right-3 top-9 w-4 h-4 text-text-muted pointer-events-none" />
                  </div>
                  
                  <div className="relative">
                    <InputField 
                      label="Teléfono *" 
                      value={formData.telefono} 
                      onChange={(e) => handleChange("telefono", e.target.value)} 
                      placeholder="Ej: +51987654321" 
                      required 
                      maxLength={20} 
                    />
                    <MdPhone className="absolute right-3 top-9 w-4 h-4 text-text-muted pointer-events-none" />
                  </div>
                </div>

                {/* Vista previa de contacto */}
                {(formData.email || formData.telefono) && (
                  <div className="bg-success-bg/20 border border-success/20 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <MdContactMail className="w-4 h-4 text-success" />
                      <span className="text-xs font-medium text-success">Información de contacto</span>
                    </div>
                    <div className="space-y-1">
                      {formData.email && (
                        <div className="flex items-center gap-2 text-xs">
                          <MdEmail className="w-3 h-3 text-text-muted" />
                          <span className="text-text-primary">{formData.email}</span>
                        </div>
                      )}
                      {formData.telefono && (
                        <div className="flex items-center gap-2 text-xs">
                          <MdPhone className="w-3 h-3 text-text-muted" />
                          <span className="text-text-primary">{formData.telefono}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Observaciones ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-text-muted pb-3 border-b border-border/50">
                  <MdNotes className="w-5 h-5" />
                  <span className="text-sm font-semibold uppercase tracking-wide">Observaciones</span>
                </div>

                <div>
                  <label className={labelClass}>Notas adicionales</label>
                  <textarea 
                    value={formData.observacion || ""} 
                    onChange={(e) => handleChange("observacion", e.target.value)} 
                    rows={6} 
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg-card text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-shadow" 
                    placeholder="Preferencias del huésped, alergias, solicitudes especiales, etc..." 
                  />
                </div>

              </div>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex gap-4 pt-6 border-t border-border/50 sticky bottom-0 bg-bg-card">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1" disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={loading} className="flex-1" disabled={!isFormValid}>
              {isEditing ? "Guardar Cambios" : "Crear Huésped"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
